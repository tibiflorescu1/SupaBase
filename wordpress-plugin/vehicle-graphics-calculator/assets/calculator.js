jQuery(document).ready(function($) {
    'use strict';
    
    let vehiclesData = [];
    let materialsData = {};
    let whitePrintSettings = {};
    let currentCalculation = {};
    
    // Initialize calculator
    initCalculator();
    
    function initCalculator() {
        loadData();
        bindEvents();
    }
    
    function loadData() {
        $('#vgc-loading').show();
        $('#vgc-calculator-form').hide();
        $('#vgc-error').hide();
        
        $.ajax({
            url: vgc_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vgc_get_vehicles',
                nonce: vgc_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    vehiclesData = response.data.vehicles;
                    materialsData = response.data.materials;
                    whitePrintSettings = response.data.white_print_settings;
                    
                    populateFilters();
                    populateMaterials();
                    
                    $('#vgc-loading').hide();
                    $('#vgc-calculator-form').show();
                } else {
                    showError('Eroare la încărcarea datelor: ' + response.data);
                }
            },
            error: function() {
                showError('Eroare de conexiune. Vă rugăm să reîncărcați pagina.');
            }
        });
    }
    
    function populateFilters() {
        // Populate categories
        const categories = [...new Set(vehiclesData.map(v => v.category_name).filter(Boolean))].sort();
        const categorySelect = $('#vgc-category');
        categories.forEach(category => {
            categorySelect.append(`<option value="${category}">${category}</option>`);
        });
        
        // Populate producers
        updateProducers();
        
        // Populate vehicles
        updateVehicles();
    }
    
    function updateProducers() {
        const selectedCategory = $('#vgc-category').val();
        let filteredVehicles = vehiclesData;
        
        if (selectedCategory) {
            filteredVehicles = vehiclesData.filter(v => v.category_name === selectedCategory);
        }
        
        const producers = [...new Set(filteredVehicles.map(v => v.producer).filter(Boolean))].sort();
        const producerSelect = $('#vgc-producer');
        
        producerSelect.empty().append('<option value="">Toți producătorii</option>');
        producers.forEach(producer => {
            producerSelect.append(`<option value="${producer}">${producer}</option>`);
        });
    }
    
    function updateVehicles() {
        const searchTerm = $('#vgc-search').val().toLowerCase();
        const selectedCategory = $('#vgc-category').val();
        const selectedProducer = $('#vgc-producer').val();
        
        let filteredVehicles = vehiclesData.filter(vehicle => {
            const searchMatch = !searchTerm || 
                vehicle.producer.toLowerCase().includes(searchTerm) ||
                vehicle.model.toLowerCase().includes(searchTerm);
            
            const categoryMatch = !selectedCategory || vehicle.category_name === selectedCategory;
            const producerMatch = !selectedProducer || vehicle.producer === selectedProducer;
            
            return searchMatch && categoryMatch && producerMatch;
        });
        
        const vehicleSelect = $('#vgc-vehicle');
        vehicleSelect.empty().append('<option value="">Alege un vehicul...</option>');
        
        filteredVehicles.forEach(vehicle => {
            const displayName = `${vehicle.producer} ${vehicle.model}${vehicle.manufacturing_period ? ` (${vehicle.manufacturing_period})` : ''}`;
            vehicleSelect.append(`<option value="${vehicle.id}">${displayName}</option>`);
        });
        
        // Reset dependent selections
        resetSelections();
    }
    
    function populateMaterials() {
        // Populate print materials
        const printSelect = $('#vgc-print-material');
        materialsData.print.forEach(material => {
            printSelect.append(`<option value="${material.id}">${material.name}</option>`);
        });
        
        // Populate lamination materials
        const laminationSelect = $('#vgc-lamination-material');
        materialsData.lamination.forEach(material => {
            laminationSelect.append(`<option value="${material.id}">${material.name}</option>`);
        });
        
        // Select first options by default
        if (materialsData.print.length > 0) {
            printSelect.val(materialsData.print[0].id);
        }
        if (materialsData.lamination.length > 0) {
            laminationSelect.val(materialsData.lamination[0].id);
        }
    }
    
    function bindEvents() {
        // Filter events
        $('#vgc-search').on('input', debounce(updateVehicles, 300));
        $('#vgc-category').on('change', function() {
            updateProducers();
            updateVehicles();
        });
        $('#vgc-producer').on('change', updateVehicles);
        
        // Selection events
        $('#vgc-vehicle').on('change', onVehicleChange);
        $('#vgc-coverage').on('change', calculatePrice);
        $('#vgc-print-material').on('change', function() {
            updateWhitePrintOption();
            calculatePrice();
        });
        $('#vgc-lamination-material').on('change', calculatePrice);
        $('#vgc-white-print').on('change', calculatePrice);
        
        // Cart event
        $('#vgc-add-to-cart').on('click', addToCart);
    }
    
    function onVehicleChange() {
        const vehicleId = $('#vgc-vehicle').val();
        
        if (!vehicleId) {
            resetSelections();
            return;
        }
        
        const vehicle = vehiclesData.find(v => v.id == vehicleId);
        if (!vehicle) return;
        
        // Populate coverages
        const coverageSelect = $('#vgc-coverage');
        coverageSelect.empty().append('<option value="">Alege o acoperire...</option>');
        
        vehicle.coverages.forEach(coverage => {
            coverageSelect.append(`<option value="${coverage.id}">${coverage.name} (${formatPrice(coverage.price)})</option>`);
        });
        
        // Populate extra options
        const optionsContainer = $('#vgc-extra-options');
        optionsContainer.empty();
        
        if (vehicle.extra_options && vehicle.extra_options.length > 0) {
            vehicle.extra_options.forEach(option => {
                const optionHtml = `
                    <div class="vgc-option-item" data-option-id="${option.id}">
                        <input type="checkbox" id="option-${option.id}" value="${option.id}">
                        <span class="vgc-option-name">${option.name}</span>
                        <span class="vgc-option-price">+${formatPrice(option.price)}</span>
                    </div>
                `;
                optionsContainer.append(optionHtml);
            });
            
            // Bind option events
            optionsContainer.find('input[type="checkbox"]').on('change', function() {
                $(this).closest('.vgc-option-item').toggleClass('selected', this.checked);
                calculatePrice();
            });
            
            optionsContainer.find('.vgc-option-item').on('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    const checkbox = $(this).find('input[type="checkbox"]');
                    checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
                }
            });
            
            $('#vgc-options-section').show();
        } else {
            $('#vgc-options-section').hide();
        }
        
        // Show sections
        $('#vgc-coverage-section').show();
        $('#vgc-materials-section').show();
        
        updateWhitePrintOption();
        calculatePrice();
    }
    
    function updateWhitePrintOption() {
        const printMaterialId = $('#vgc-print-material').val();
        const printMaterial = materialsData.print.find(m => m.id == printMaterialId);
        
        if (printMaterial && printMaterial.allows_white_print == 1) {
            $('#vgc-white-print-section').show();
        } else {
            $('#vgc-white-print-section').hide();
            $('#vgc-white-print').prop('checked', false);
        }
    }
    
    function calculatePrice() {
        const vehicleId = $('#vgc-vehicle').val();
        const coverageId = $('#vgc-coverage').val();
        const printMaterialId = $('#vgc-print-material').val();
        const laminationMaterialId = $('#vgc-lamination-material').val();
        const whitePrint = $('#vgc-white-print').is(':checked');
        
        if (!vehicleId || !coverageId || !printMaterialId || !laminationMaterialId) {
            updateSummary(null);
            return;
        }
        
        const vehicle = vehiclesData.find(v => v.id == vehicleId);
        const coverage = vehicle.coverages.find(c => c.id == coverageId);
        const printMaterial = materialsData.print.find(m => m.id == printMaterialId);
        const laminationMaterial = materialsData.lamination.find(m => m.id == laminationMaterialId);
        
        // Get selected extra options
        const selectedOptions = [];
        $('#vgc-extra-options input[type="checkbox"]:checked').each(function() {
            const optionId = $(this).val();
            const option = vehicle.extra_options.find(o => o.id == optionId);
            if (option) selectedOptions.push(option);
        });
        
        // Calculate breakdown
        const breakdown = [];
        const basePrice = parseFloat(coverage.price);
        breakdown.push({
            label: `Preț bază (${coverage.name})`,
            value: basePrice
        });
        
        const optionsTotal = selectedOptions.reduce((sum, option) => sum + parseFloat(option.price), 0);
        if (optionsTotal > 0) {
            breakdown.push({
                label: 'Opțiuni extra selectate',
                value: optionsTotal
            });
        }
        
        const vehiclePrice = basePrice + optionsTotal;
        
        const printCost = printMaterial.calculation_type === 'fixed_amount' 
            ? parseFloat(printMaterial.value)
            : vehiclePrice * (parseFloat(printMaterial.value) / 100);
        breakdown.push({
            label: `Cost print (${printMaterial.name})`,
            value: printCost
        });
        
        const laminationCost = laminationMaterial.calculation_type === 'fixed_amount'
            ? parseFloat(laminationMaterial.value)
            : vehiclePrice * (parseFloat(laminationMaterial.value) / 100);
        breakdown.push({
            label: `Cost laminare (${laminationMaterial.name})`,
            value: laminationCost
        });
        
        let whitePrintCost = 0;
        if (whitePrint && printMaterial.allows_white_print == 1 && whitePrintSettings) {
            whitePrintCost = whitePrintSettings.calculation_type === 'fixed_amount'
                ? parseFloat(whitePrintSettings.value)
                : (vehiclePrice + printCost) * (parseFloat(whitePrintSettings.value) / 100);
            breakdown.push({
                label: 'Cost extra - Print cu Alb',
                value: whitePrintCost
            });
        }
        
        const total = vehiclePrice + printCost + laminationCost + whitePrintCost;
        
        currentCalculation = {
            vehicle,
            coverage,
            selectedOptions,
            printMaterial,
            laminationMaterial,
            whitePrint,
            breakdown,
            total
        };
        
        updateSummary(currentCalculation);
    }
    
    function updateSummary(calculation) {
        const summaryContent = $('.vgc-summary-content');
        
        if (!calculation) {
            summaryContent.html('<p class="vgc-no-selection">Selectează un vehicul pentru a începe calculul.</p>');
            $('#vgc-cart-section').hide();
            return;
        }
        
        let html = `
            <div class="vgc-vehicle-info">
                <div class="vgc-vehicle-name">${calculation.vehicle.producer} ${calculation.vehicle.model}</div>
                <div class="vgc-coverage-name">${calculation.coverage.name}</div>
        `;
        
        if (calculation.selectedOptions.length > 0) {
            html += '<div class="vgc-selected-options">';
            calculation.selectedOptions.forEach(option => {
                html += `<div class="vgc-selected-option">${option.name}</div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        
        html += '<div class="vgc-breakdown">';
        calculation.breakdown.forEach(item => {
            html += `
                <div class="vgc-breakdown-item">
                    <span class="vgc-breakdown-label">${item.label}</span>
                    <span class="vgc-breakdown-value">${formatPrice(item.value)}</span>
                </div>
            `;
        });
        html += '</div>';
        
        html += `
            <div class="vgc-total">
                <div class="vgc-total-row">
                    <span>TOTAL</span>
                    <span class="vgc-total-amount">${formatPrice(calculation.total)}</span>
                </div>
            </div>
        `;
        
        summaryContent.html(html);
        $('#vgc-cart-section').show();
    }
    
    function addToCart() {
        if (!currentCalculation || !vgc_ajax.woocommerce_active) {
            showMessage('WooCommerce nu este activ sau calculul nu este complet.', 'error');
            return;
        }
        
        const button = $('#vgc-add-to-cart');
        button.prop('disabled', true).html('<span class="vgc-cart-icon">⏳</span> Se adaugă...');
        
        const extraOptionIds = currentCalculation.selectedOptions.map(option => option.id);
        
        $.ajax({
            url: vgc_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vgc_add_to_cart',
                nonce: vgc_ajax.nonce,
                vehicle_id: currentCalculation.vehicle.id,
                coverage_id: currentCalculation.coverage.id,
                extra_options: extraOptionIds,
                print_material_id: currentCalculation.printMaterial.id,
                lamination_material_id: currentCalculation.laminationMaterial.id,
                white_print: currentCalculation.whitePrint,
                total_price: currentCalculation.total
            },
            success: function(response) {
                if (response.success) {
                    showMessage('Produsul a fost adăugat în coș cu succes!', 'success');
                    
                    // Optional: redirect to cart
                    if (response.data.cart_url) {
                        setTimeout(() => {
                            window.location.href = response.data.cart_url;
                        }, 2000);
                    }
                } else {
                    showMessage('Eroare: ' + response.data, 'error');
                }
            },
            error: function() {
                showMessage('Eroare de conexiune. Vă rugăm să încercați din nou.', 'error');
            },
            complete: function() {
                button.prop('disabled', false).html('<span class="vgc-cart-icon">🛒</span> Adaugă în Coș');
            }
        });
    }
    
    function resetSelections() {
        $('#vgc-coverage').empty().append('<option value="">Alege o acoperire...</option>');
        $('#vgc-extra-options').empty();
        $('#vgc-white-print').prop('checked', false);
        
        $('#vgc-coverage-section').hide();
        $('#vgc-options-section').hide();
        $('#vgc-materials-section').hide();
        $('#vgc-white-print-section').hide();
        $('#vgc-cart-section').hide();
        
        updateSummary(null);
    }
    
    function showMessage(message, type) {
        const messageDiv = $('#vgc-cart-message');
        messageDiv.removeClass('success error').addClass(type).text(message).show();
        
        setTimeout(() => {
            messageDiv.fadeOut();
        }, 5000);
    }
    
    function showError(message) {
        $('#vgc-loading').hide();
        $('#vgc-calculator-form').hide();
        $('#vgc-error').show().find('p').text(message);
    }
    
    function formatPrice(price) {
        return parseFloat(price).toFixed(2) + ' ' + (vgc_ajax.currency || 'RON');
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
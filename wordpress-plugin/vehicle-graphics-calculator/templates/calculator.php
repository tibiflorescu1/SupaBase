<div id="vgc-calculator" class="vgc-calculator-container">
    <?php if ($atts['show_title'] === 'true'): ?>
        <h3 class="vgc-title">Calculator Grafică Vehicule</h3>
    <?php endif; ?>
    
    <div class="vgc-loading" id="vgc-loading">
        <div class="vgc-spinner"></div>
        <p>Se încarcă datele...</p>
    </div>
    
    <div class="vgc-calculator" id="vgc-calculator-form" style="display: none;">
        <div class="vgc-row">
            <div class="vgc-col-left">
                <!-- Vehicle Selection -->
                <div class="vgc-section">
                    <h4>1. Selectează vehiculul</h4>
                    <div class="vgc-filters">
                        <input type="text" id="vgc-search" placeholder="Caută după producător sau model..." class="vgc-input">
                        <select id="vgc-category" class="vgc-select">
                            <option value="">Toate categoriile</option>
                        </select>
                        <select id="vgc-producer" class="vgc-select">
                            <option value="">Toți producătorii</option>
                        </select>
                    </div>
                    <select id="vgc-vehicle" class="vgc-select vgc-vehicle-select">
                        <option value="">Alege un vehicul...</option>
                    </select>
                </div>
                
                <!-- Coverage Selection -->
                <div class="vgc-section" id="vgc-coverage-section" style="display: none;">
                    <h4>2. Selectează acoperirea</h4>
                    <select id="vgc-coverage" class="vgc-select">
                        <option value="">Alege o acoperire...</option>
                    </select>
                </div>
                
                <!-- Extra Options -->
                <div class="vgc-section" id="vgc-options-section" style="display: none;">
                    <h4>3. Opțiuni extra</h4>
                    <div id="vgc-extra-options" class="vgc-options-list">
                        <!-- Options will be populated here -->
                    </div>
                </div>
                
                <!-- Materials Selection -->
                <div class="vgc-section" id="vgc-materials-section" style="display: none;">
                    <h4>4. Selectează materialele</h4>
                    <div class="vgc-materials-row">
                        <div class="vgc-material-col">
                            <label>Material Print:</label>
                            <select id="vgc-print-material" class="vgc-select">
                                <!-- Options will be populated -->
                            </select>
                        </div>
                        <div class="vgc-material-col">
                            <label>Material Laminare:</label>
                            <select id="vgc-lamination-material" class="vgc-select">
                                <!-- Options will be populated -->
                            </select>
                        </div>
                    </div>
                    <div class="vgc-white-print" id="vgc-white-print-section" style="display: none;">
                        <label class="vgc-checkbox-label">
                            <input type="checkbox" id="vgc-white-print">
                            <span class="vgc-checkmark"></span>
                            Adaugă Print cu Alb
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="vgc-col-right">
                <!-- Summary -->
                <div class="vgc-summary" id="vgc-summary">
                    <h3>Rezumat Ofertă</h3>
                    <div class="vgc-summary-content">
                        <p class="vgc-no-selection">Selectează un vehicul pentru a începe calculul.</p>
                    </div>
                </div>
                
                <!-- Add to Cart Button -->
                <div class="vgc-cart-section" id="vgc-cart-section" style="display: none;">
                    <button id="vgc-add-to-cart" class="vgc-btn vgc-btn-primary">
                        <span class="vgc-cart-icon">🛒</span>
                        Adaugă în Coș
                    </button>
                    <div id="vgc-cart-message" class="vgc-message" style="display: none;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="vgc-error" id="vgc-error" style="display: none;">
        <p>Eroare la încărcarea datelor. Vă rugăm să reîncărcați pagina.</p>
    </div>
</div>
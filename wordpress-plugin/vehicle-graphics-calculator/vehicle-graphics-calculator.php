<?php
/**
 * Plugin Name: Vehicle Graphics Calculator
 * Plugin URI: https://your-website.com
 * Description: Calculator pentru prețuri grafică vehicule cu integrare WooCommerce
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: vehicle-graphics-calc
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('VGC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VGC_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('VGC_VERSION', '1.0.0');

// Include Supabase client
require_once VGC_PLUGIN_PATH . 'includes/supabase-client.php';

// Main plugin class
class VehicleGraphicsCalculator {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('vehicle_calculator', array($this, 'calculator_shortcode'));
        
        // AJAX actions
        add_action('wp_ajax_vgc_get_vehicles', array($this, 'ajax_get_vehicles'));
        add_action('wp_ajax_nopriv_vgc_get_vehicles', array($this, 'ajax_get_vehicles'));
        add_action('wp_ajax_vgc_add_to_cart', array($this, 'ajax_add_to_cart'));
        add_action('wp_ajax_nopriv_vgc_add_to_cart', array($this, 'ajax_add_to_cart'));
        
        // Admin hooks
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        
        // Database hooks
        register_activation_hook(__FILE__, array($this, 'create_tables'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        load_plugin_textdomain('vehicle-graphics-calc', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('vgc-calculator', VGC_PLUGIN_URL . 'assets/calculator.js', array('jquery'), VGC_VERSION, true);
        wp_enqueue_style('vgc-calculator', VGC_PLUGIN_URL . 'assets/calculator.css', array(), VGC_VERSION);
        
        wp_localize_script('vgc-calculator', 'vgc_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('vgc_nonce'),
            'currency' => get_woocommerce_currency_symbol(),
            'woocommerce_active' => class_exists('WooCommerce')
        ));
    }
    
    public function calculator_shortcode($atts) {
        $atts = shortcode_atts(array(
            'show_title' => 'true',
            'theme' => 'default'
        ), $atts);
        
        ob_start();
        include VGC_PLUGIN_PATH . 'templates/calculator.php';
        return ob_get_clean();
    }
    
    public function ajax_get_vehicles() {
        check_ajax_referer('vgc_nonce', 'nonce');
        
        error_log('VGC: AJAX get_vehicles called');
        
        $supabase = new VGC_Supabase_Client();
        $data = $supabase->get_calculator_data();
        
        if (is_wp_error($data)) {
            error_log('VGC: Error getting data: ' . $data->get_error_message());
            wp_send_json_error('Eroare la încărcarea datelor: ' . $data->get_error_message());
            return;
        }
        
        error_log('VGC: Data loaded successfully. Vehicles: ' . count($data['vehicles']));
        
        // Transform data to match frontend expectations
        $vehicles = array();
        foreach ($data['vehicles'] as $vehicle) {
            $vehicles[] = (object) array(
                'id' => $vehicle['id'],
                'producer' => isset($vehicle['producator']) ? $vehicle['producator'] : '',
                'model' => $vehicle['model'],
                'category_name' => isset($vehicle['category_name']) ? $vehicle['category_name'] : 'Necunoscută',
                'manufacturing_period' => isset($vehicle['perioada_fabricatie']) ? $vehicle['perioada_fabricatie'] : '',
                'coverages' => isset($vehicle['coverages']) ? array_map(function($coverage) {
                    return (object) array(
                        'id' => $coverage['id'],
                        'name' => $coverage['nume'],
                        'price' => $coverage['pret']
                    );
                }, $vehicle['coverages']) : array(),
                'extra_options' => isset($vehicle['extra_options']) ? array_map(function($option) {
                    return (object) array(
                        'id' => $option['id'],
                        'name' => $option['nume'],
                        'price' => $option['pret']
                    );
                }, $vehicle['extra_options']) : array()
            );
        }
        
        $materials = array(
            'print' => isset($data['print_materials']) ? array_map(function($material) {
                return (object) array(
                    'id' => $material['id'],
                    'name' => $material['nume'],
                    'calculation_type' => $material['tip_calcul'] === 'procentual' ? 'percentage' : 'fixed_amount',
                    'value' => $material['valoare'],
                    'allows_white_print' => $material['permite_print_alb'] ? 1 : 0
                );
            }, $data['print_materials']) : array(),
            'lamination' => isset($data['lamination_materials']) ? array_map(function($material) {
                return (object) array(
                    'id' => $material['id'],
                    'name' => $material['nume'],
                    'calculation_type' => $material['tip_calcul'] === 'procentual' ? 'percentage' : 'fixed_amount',
                    'value' => $material['valoare']
                );
            }, $data['lamination_materials']) : array()
        );
        
        $white_print_settings = isset($data['white_print_settings']) ? (object) array(
            'calculation_type' => $data['white_print_settings']['tip_calcul'] === 'procentual' ? 'percentage' : 'fixed_amount',
            'value' => $data['white_print_settings']['valoare']
        ) : (object) array(
            'calculation_type' => 'percentage',
            'value' => 35
        );
        
        error_log('VGC: Sending response with ' . count($vehicles) . ' vehicles');
        
        wp_send_json_success(array(
            'vehicles' => $vehicles,
            'materials' => $materials,
            'white_print_settings' => $white_print_settings
        ));
    }
    
    public function ajax_add_to_cart() {
        check_ajax_referer('vgc_nonce', 'nonce');
        
        if (!class_exists('WooCommerce')) {
            wp_send_json_error('WooCommerce nu este activ');
        }
        
        // Get data from Supabase
        $supabase = new VGC_Supabase_Client();
        $data = $supabase->get_calculator_data();
        
        if (is_wp_error($data)) {
            wp_send_json_error('Eroare la preluarea datelor: ' . $data->get_error_message());
        }
        
        $vehicle_id = sanitize_text_field($_POST['vehicle_id']);
        $coverage_id = sanitize_text_field($_POST['coverage_id']);
        $extra_options = isset($_POST['extra_options']) ? array_map('sanitize_text_field', $_POST['extra_options']) : array();
        $print_material_id = sanitize_text_field($_POST['print_material_id']);
        $lamination_material_id = sanitize_text_field($_POST['lamination_material_id']);
        $white_print = isset($_POST['white_print']) ? true : false;
        $total_price = floatval($_POST['total_price']);
        
        // Find vehicle and coverage from Supabase data
        $vehicle = null;
        $coverage = null;
        $selected_extra_options = array();
        
        foreach ($data['vehicles'] as $v) {
            if ($v['id'] === $vehicle_id) {
                $vehicle = $v;
                
                // Find coverage
                foreach ($v['coverages'] as $c) {
                    if ($c['id'] === $coverage_id) {
                        $coverage = $c;
                        break;
                    }
                }
                
                // Find selected extra options
                foreach ($v['extra_options'] as $option) {
                    if (in_array($option['id'], $extra_options)) {
                        $selected_extra_options[] = $option;
                    }
                }
                break;
            }
        }
        
        if (!$vehicle || !$coverage) {
            wp_send_json_error('Vehicul sau acoperire invalidă');
        }
        
        // Find materials
        $print_material = null;
        $lamination_material = null;
        
        foreach ($data['print_materials'] as $material) {
            if ($material['id'] === $print_material_id) {
                $print_material = $material;
                break;
            }
        }
        
        foreach ($data['lamination_materials'] as $material) {
            if ($material['id'] === $lamination_material_id) {
                $lamination_material = $material;
                break;
            }
        }
        
        // Create product title
        $product_title = sprintf(
            'Grafică %s %s - %s',
            $vehicle['producator'],
            $vehicle['model'],
            $coverage['nume']
        );
        
        // Create custom product data
        $cart_item_data = array(
            'vgc_vehicle' => $vehicle,
            'vgc_coverage' => $coverage,
            'vgc_extra_options' => $selected_extra_options,
            'vgc_print_material' => $print_material,
            'vgc_lamination_material' => $lamination_material,
            'vgc_white_print' => $white_print,
            'vgc_total_price' => $total_price,
            'vgc_custom_product' => true
        );
        
        // Add to cart
        $cart_item_key = WC()->cart->add_to_cart(
            0, // No existing product ID
            1, // Quantity
            0, // Variation ID
            array(), // Variation data
            $cart_item_data
        );
        
        if ($cart_item_key) {
            wp_send_json_success(array(
                'message' => 'Produsul a fost adăugat în coș',
                'cart_url' => wc_get_cart_url()
            ));
        } else {
            wp_send_json_error('Eroare la adăugarea în coș');
        }
    }
    
    public function admin_menu() {
        add_menu_page(
            'Vehicle Graphics Calculator',
            'VG Calculator',
            'manage_options',
            'vgc-admin',
            array($this, 'admin_page'),
            'dashicons-calculator',
            30
        );
        
        add_submenu_page(
            'vgc-admin',
            'Vehicule',
            'Vehicule',
            'manage_options',
            'vgc-vehicles',
            array($this, 'vehicles_page')
        );
        
        add_submenu_page(
            'vgc-admin',
            'Materiale',
            'Materiale',
            'manage_options',
            'vgc-materials',
            array($this, 'materials_page')
        );
        
        add_submenu_page(
            'vgc-admin',
            'Setări Supabase',
            'Setări Supabase',
            'manage_options',
            'vgc-supabase',
            array($this, 'supabase_page')
        );
    }
    
    public function admin_init() {
        // Register settings
        register_setting('vgc_supabase_settings', 'vgc_supabase_url');
        register_setting('vgc_supabase_settings', 'vgc_supabase_key');
    }
    
    public function admin_page() {
        include VGC_PLUGIN_PATH . 'admin/admin-page.php';
    }
    
    public function vehicles_page() {
        include VGC_PLUGIN_PATH . 'admin/vehicles-page.php';
    }
    
    public function materials_page() {
        include VGC_PLUGIN_PATH . 'admin/materials-page.php';
    }
    
    public function supabase_page() {
        include VGC_PLUGIN_PATH . 'admin/supabase-page.php';
    }
    
    public function create_tables() {
        // Nu mai creăm tabele locale - folosim Supabase
        // Doar setăm opțiuni default
        add_option('vgc_supabase_url', '');
        add_option('vgc_supabase_key', '');
    }
    
    public function deactivate() {
        // Cleanup if needed
    }
}

// WooCommerce integration hooks
if (class_exists('WooCommerce')) {
    
    // Modify cart item data
    add_filter('woocommerce_add_cart_item_data', 'vgc_add_cart_item_data', 10, 3);
    function vgc_add_cart_item_data($cart_item_data, $product_id, $variation_id) {
        if (isset($cart_item_data['vgc_custom_product'])) {
            $cart_item_data['unique_key'] = md5(microtime().rand());
        }
        return $cart_item_data;
    }
    
    // Display custom data in cart
    add_filter('woocommerce_get_item_data', 'vgc_display_cart_item_data', 10, 2);
    function vgc_display_cart_item_data($item_data, $cart_item) {
        if (isset($cart_item['vgc_custom_product'])) {
            $vehicle = $cart_item['vgc_vehicle'];
            $coverage = $cart_item['vgc_coverage'];
            
            $item_data[] = array(
                'key' => 'Vehicul',
                'value' => $vehicle['producator'] . ' ' . $vehicle['model']
            );
            
            $item_data[] = array(
                'key' => 'Acoperire',
                'value' => $coverage['nume']
            );
            
            if (!empty($cart_item['vgc_extra_options'])) {
                $options = array();
                foreach ($cart_item['vgc_extra_options'] as $option) {
                    $options[] = $option['nume'];
                }
                $item_data[] = array(
                    'key' => 'Opțiuni Extra',
                    'value' => implode(', ', $options)
                );
            }
            
            $item_data[] = array(
                'key' => 'Material Print',
                'value' => $cart_item['vgc_print_material']['nume']
            );
            
            $item_data[] = array(
                'key' => 'Material Laminare',
                'value' => $cart_item['vgc_lamination_material']['nume']
            );
            
            if ($cart_item['vgc_white_print']) {
                $item_data[] = array(
                    'key' => 'Print cu Alb',
                    'value' => 'Da'
                );
            }
        }
        
        return $item_data;
    }
    
    // Set custom product name and price
    add_action('woocommerce_before_calculate_totals', 'vgc_set_custom_price');
    function vgc_set_custom_price($cart) {
        if (is_admin() && !defined('DOING_AJAX')) return;
        
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            if (isset($cart_item['vgc_custom_product'])) {
                $vehicle = $cart_item['vgc_vehicle'];
                $coverage = $cart_item['vgc_coverage'];
                
                $product_name = sprintf(
                    'Grafică %s %s - %s',
                    $vehicle['producator'],
                    $vehicle['model'],
                    $coverage['nume']
                );
                
                $cart_item['data']->set_name($product_name);
                $cart_item['data']->set_price($cart_item['vgc_total_price']);
            }
        }
    }
    
    // Save custom data to order
    add_action('woocommerce_checkout_create_order_line_item', 'vgc_save_order_item_data', 10, 4);
    function vgc_save_order_item_data($item, $cart_item_key, $values, $order) {
        if (isset($values['vgc_custom_product'])) {
            $vehicle = $values['vgc_vehicle'];
            $coverage = $values['vgc_coverage'];
            
            $item->add_meta_data('Vehicul', $vehicle['producator'] . ' ' . $vehicle['model']);
            $item->add_meta_data('Acoperire', $coverage['nume']);
            
            if (!empty($values['vgc_extra_options'])) {
                $options = array();
                foreach ($values['vgc_extra_options'] as $option) {
                    $options[] = $option['nume'];
                }
                $item->add_meta_data('Opțiuni Extra', implode(', ', $options));
            }
            
            $item->add_meta_data('Material Print', $values['vgc_print_material']['nume']);
            $item->add_meta_data('Material Laminare', $values['vgc_lamination_material']['nume']);
            
            if ($values['vgc_white_print']) {
                $item->add_meta_data('Print cu Alb', 'Da');
            }
        }
    }
}

// Initialize the plugin
new VehicleGraphicsCalculator();
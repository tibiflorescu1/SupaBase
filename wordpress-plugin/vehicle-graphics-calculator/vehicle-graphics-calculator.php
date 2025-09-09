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
        
        global $wpdb;
        
        $vehicles = $wpdb->get_results("
            SELECT v.*, c.nume as category_name 
            FROM {$wpdb->prefix}vgc_vehicles v 
            LEFT JOIN {$wpdb->prefix}vgc_categories c ON v.category_id = c.id 
            ORDER BY v.producer, v.model
        ");
        
        foreach ($vehicles as &$vehicle) {
            $vehicle->coverages = $wpdb->get_results($wpdb->prepare("
                SELECT * FROM {$wpdb->prefix}vgc_coverages 
                WHERE vehicle_id = %d ORDER BY name
            ", $vehicle->id));
            
            $vehicle->extra_options = $wpdb->get_results($wpdb->prepare("
                SELECT * FROM {$wpdb->prefix}vgc_extra_options 
                WHERE vehicle_id = %d ORDER BY name
            ", $vehicle->id));
        }
        
        $materials = array(
            'print' => $wpdb->get_results("SELECT * FROM {$wpdb->prefix}vgc_print_materials ORDER BY name"),
            'lamination' => $wpdb->get_results("SELECT * FROM {$wpdb->prefix}vgc_lamination_materials ORDER BY name")
        );
        
        $white_print_settings = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}vgc_white_print_settings LIMIT 1");
        
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
        
        $vehicle_id = intval($_POST['vehicle_id']);
        $coverage_id = intval($_POST['coverage_id']);
        $extra_options = isset($_POST['extra_options']) ? array_map('intval', $_POST['extra_options']) : array();
        $print_material_id = intval($_POST['print_material_id']);
        $lamination_material_id = intval($_POST['lamination_material_id']);
        $white_print = isset($_POST['white_print']) ? true : false;
        $total_price = floatval($_POST['total_price']);
        
        global $wpdb;
        
        // Get vehicle and coverage details
        $vehicle = $wpdb->get_row($wpdb->prepare("
            SELECT v.*, c.nume as category_name 
            FROM {$wpdb->prefix}vgc_vehicles v 
            LEFT JOIN {$wpdb->prefix}vgc_categories c ON v.category_id = c.id 
            WHERE v.id = %d
        ", $vehicle_id));
        
        $coverage = $wpdb->get_row($wpdb->prepare("
            SELECT * FROM {$wpdb->prefix}vgc_coverages WHERE id = %d
        ", $coverage_id));
        
        if (!$vehicle || !$coverage) {
            wp_send_json_error('Vehicul sau acoperire invalidă');
        }
        
        // Create product title
        $product_title = sprintf(
            'Grafică %s %s - %s',
            $vehicle->producer,
            $vehicle->model,
            $coverage->name
        );
        
        // Get extra options details
        $extra_options_details = array();
        if (!empty($extra_options)) {
            $placeholders = implode(',', array_fill(0, count($extra_options), '%d'));
            $extra_options_details = $wpdb->get_results($wpdb->prepare("
                SELECT * FROM {$wpdb->prefix}vgc_extra_options 
                WHERE id IN ($placeholders)
            ", $extra_options));
        }
        
        // Get materials
        $print_material = $wpdb->get_row($wpdb->prepare("
            SELECT * FROM {$wpdb->prefix}vgc_print_materials WHERE id = %d
        ", $print_material_id));
        
        $lamination_material = $wpdb->get_row($wpdb->prepare("
            SELECT * FROM {$wpdb->prefix}vgc_lamination_materials WHERE id = %d
        ", $lamination_material_id));
        
        // Create custom product data
        $cart_item_data = array(
            'vgc_vehicle' => $vehicle,
            'vgc_coverage' => $coverage,
            'vgc_extra_options' => $extra_options_details,
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
    }
    
    public function admin_init() {
        // Register settings
        register_setting('vgc_settings', 'vgc_options');
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
    
    public function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Categories table
        $sql = "CREATE TABLE {$wpdb->prefix}vgc_categories (
            id int(11) NOT NULL AUTO_INCREMENT,
            nume varchar(255) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Vehicles table
        $sql .= "CREATE TABLE {$wpdb->prefix}vgc_vehicles (
            id int(11) NOT NULL AUTO_INCREMENT,
            producer varchar(255) NOT NULL,
            model varchar(255) NOT NULL,
            category_id int(11),
            manufacturing_period varchar(100),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY category_id (category_id)
        ) $charset_collate;";
        
        // Coverages table
        $sql .= "CREATE TABLE {$wpdb->prefix}vgc_coverages (
            id int(11) NOT NULL AUTO_INCREMENT,
            vehicle_id int(11) NOT NULL,
            name varchar(255) NOT NULL,
            price decimal(10,2) NOT NULL,
            file_link varchar(500),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY vehicle_id (vehicle_id)
        ) $charset_collate;";
        
        // Extra options table
        $sql .= "CREATE TABLE {$wpdb->prefix}vgc_extra_options (
            id int(11) NOT NULL AUTO_INCREMENT,
            vehicle_id int(11) NOT NULL,
            name varchar(255) NOT NULL,
            price decimal(10,2) NOT NULL,
            file_link varchar(500),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY vehicle_id (vehicle_id)
        ) $charset_collate;";
        
        // Print materials table
        $sql .= "CREATE TABLE {$wpdb->prefix}vgc_print_materials (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            calculation_type enum('percentage','fixed_amount') NOT NULL,
            value decimal(10,2) NOT NULL,
            allows_white_print tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Lamination materials table
        $sql .= "CREATE TABLE {$wpdb->prefix}vgc_lamination_materials (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            calculation_type enum('percentage','fixed_amount') NOT NULL,
            value decimal(10,2) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // White print settings table
        $sql .= "CREATE TABLE {$wpdb->prefix}vgc_white_print_settings (
            id int(11) NOT NULL AUTO_INCREMENT,
            calculation_type enum('percentage','fixed_amount') NOT NULL,
            value decimal(10,2) NOT NULL,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Insert default data
        $this->insert_default_data();
    }
    
    private function insert_default_data() {
        global $wpdb;
        
        // Insert default white print settings
        $wpdb->insert(
            $wpdb->prefix . 'vgc_white_print_settings',
            array(
                'calculation_type' => 'percentage',
                'value' => 35.00
            )
        );
        
        // Insert sample categories
        $categories = array('Sedan', 'SUV', 'Hatchback', 'Coupe');
        foreach ($categories as $category) {
            $wpdb->insert(
                $wpdb->prefix . 'vgc_categories',
                array('nume' => $category)
            );
        }
        
        // Insert sample print materials
        $print_materials = array(
            array('name' => 'Folie Standard', 'calculation_type' => 'percentage', 'value' => 15.00, 'allows_white_print' => 1),
            array('name' => 'Folie Premium', 'calculation_type' => 'percentage', 'value' => 25.00, 'allows_white_print' => 1),
            array('name' => 'Vinil Economic', 'calculation_type' => 'fixed_amount', 'value' => 200.00, 'allows_white_print' => 0)
        );
        
        foreach ($print_materials as $material) {
            $wpdb->insert($wpdb->prefix . 'vgc_print_materials', $material);
        }
        
        // Insert sample lamination materials
        $lamination_materials = array(
            array('name' => 'Laminare Mat', 'calculation_type' => 'percentage', 'value' => 10.00),
            array('name' => 'Laminare Lucios', 'calculation_type' => 'percentage', 'value' => 12.00),
            array('name' => 'Laminare Premium', 'calculation_type' => 'fixed_amount', 'value' => 150.00)
        );
        
        foreach ($lamination_materials as $material) {
            $wpdb->insert($wpdb->prefix . 'vgc_lamination_materials', $material);
        }
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
                'value' => $vehicle->producer . ' ' . $vehicle->model
            );
            
            $item_data[] = array(
                'key' => 'Acoperire',
                'value' => $coverage->name
            );
            
            if (!empty($cart_item['vgc_extra_options'])) {
                $options = array();
                foreach ($cart_item['vgc_extra_options'] as $option) {
                    $options[] = $option->name;
                }
                $item_data[] = array(
                    'key' => 'Opțiuni Extra',
                    'value' => implode(', ', $options)
                );
            }
            
            $item_data[] = array(
                'key' => 'Material Print',
                'value' => $cart_item['vgc_print_material']->name
            );
            
            $item_data[] = array(
                'key' => 'Material Laminare',
                'value' => $cart_item['vgc_lamination_material']->name
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
                    $vehicle->producer,
                    $vehicle->model,
                    $coverage->name
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
            
            $item->add_meta_data('Vehicul', $vehicle->producer . ' ' . $vehicle->model);
            $item->add_meta_data('Acoperire', $coverage->name);
            
            if (!empty($values['vgc_extra_options'])) {
                $options = array();
                foreach ($values['vgc_extra_options'] as $option) {
                    $options[] = $option->name;
                }
                $item->add_meta_data('Opțiuni Extra', implode(', ', $options));
            }
            
            $item->add_meta_data('Material Print', $values['vgc_print_material']->name);
            $item->add_meta_data('Material Laminare', $values['vgc_lamination_material']->name);
            
            if ($values['vgc_white_print']) {
                $item->add_meta_data('Print cu Alb', 'Da');
            }
        }
    }
}

// Initialize the plugin
new VehicleGraphicsCalculator();
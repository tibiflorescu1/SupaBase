<?php
if (!defined('ABSPATH')) {
    exit;
}

class VGC_Supabase_Client {
    private $supabase_url;
    private $supabase_key;
    
    public function __construct() {
        $this->supabase_url = get_option('vgc_supabase_url', '');
        $this->supabase_key = get_option('vgc_supabase_key', '');
    }
    
    private function make_request($endpoint, $method = 'GET', $data = null) {
        if (empty($this->supabase_url) || empty($this->supabase_key)) {
            error_log('VGC: Supabase URL sau API Key lipsesc');
            return new WP_Error('missing_config', 'Supabase URL sau API Key lipsesc. Configurează în VG Calculator → Setări Supabase');
        }
        
        $url = rtrim($this->supabase_url, '/') . '/rest/v1/' . ltrim($endpoint, '/');
        error_log('VGC: Making request to: ' . $url);
        
        $headers = array(
            'apikey' => $this->supabase_key,
            'Authorization' => 'Bearer ' . $this->supabase_key,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation'
        );
        
        $args = array(
            'method' => $method,
            'headers' => $headers,
            'timeout' => 30
        );
        
        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            error_log('VGC: WP Error: ' . $response->get_error_message());
            return $response;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        error_log('VGC: Response status: ' . $status_code);
        error_log('VGC: Response body: ' . substr($body, 0, 200) . '...');
        
        if ($status_code >= 400) {
            error_log('VGC: Supabase Error: ' . $body);
            return new WP_Error('supabase_error', 'Supabase Error: ' . $body, array('status' => $status_code));
        }
        
        $decoded = json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('VGC: JSON decode error: ' . json_last_error_msg());
            return new WP_Error('json_error', 'Eroare la decodarea răspunsului JSON');
        }
        
        return $decoded;
    }
    
    // Get all categories
    public function get_categories() {
        return $this->make_request('categorii?select=*&order=nume.asc');
    }
    
    // Get all vehicles with related data
    public function get_vehicles() {
        $vehicles = $this->make_request('vehicule?select=*&order=producator.asc,model.asc');
        
        if (is_wp_error($vehicles)) {
            return $vehicles;
        }
        
        // Get related data for each vehicle
        foreach ($vehicles as &$vehicle) {
            // Get coverages
            $coverages = $this->make_request("acoperiri?vehicle_id=eq.{$vehicle['id']}&select=*&order=nume.asc");
            $vehicle['coverages'] = is_wp_error($coverages) ? [] : $coverages;
            
            // Get extra options
            $options = $this->make_request("optiuni_extra?vehicle_id=eq.{$vehicle['id']}&select=*&order=nume.asc");
            $vehicle['extra_options'] = is_wp_error($options) ? [] : $options;
        }
        
        return $vehicles;
    }
    
    // Get print materials
    public function get_print_materials() {
        return $this->make_request('materiale_print?select=*&order=nume.asc');
    }
    
    // Get lamination materials
    public function get_lamination_materials() {
        return $this->make_request('materiale_laminare?select=*&order=nume.asc');
    }
    
    // Get white print settings
    public function get_white_print_settings() {
        $settings = $this->make_request('setari_print_alb?select=*&limit=1');
        
        if (is_wp_error($settings) || empty($settings)) {
            return array(
                'tip_calcul' => 'procentual',
                'valoare' => 35
            );
        }
        
        return $settings[0];
    }
    
    // Get all data for calculator
    public function get_calculator_data() {
        $categories = $this->get_categories();
        $vehicles = $this->get_vehicles();
        $print_materials = $this->get_print_materials();
        $lamination_materials = $this->get_lamination_materials();
        $white_print_settings = $this->get_white_print_settings();
        
        // Check for errors
        if (is_wp_error($categories)) {
            return $categories;
        }
        if (is_wp_error($vehicles)) {
            return $vehicles;
        }
        if (is_wp_error($print_materials)) {
            return $print_materials;
        }
        if (is_wp_error($lamination_materials)) {
            return $lamination_materials;
        }
        
        // Add category names to vehicles
        $category_map = array();
        foreach ($categories as $category) {
            $category_map[$category['id']] = $category['nume'];
        }
        
        foreach ($vehicles as &$vehicle) {
            $vehicle['category_name'] = isset($category_map[$vehicle['categorie_id']]) 
                ? $category_map[$vehicle['categorie_id']] 
                : 'Necunoscută';
        }
        
        return array(
            'categories' => $categories,
            'vehicles' => $vehicles,
            'print_materials' => $print_materials,
            'lamination_materials' => $lamination_materials,
            'white_print_settings' => $white_print_settings
        );
    }
    
    // Test connection
    public function test_connection() {
        $result = $this->make_request('categorii?select=count&limit=1');
        return !is_wp_error($result);
    }
}
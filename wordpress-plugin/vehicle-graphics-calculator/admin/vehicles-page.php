<?php
if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

// Handle form submissions
if (isset($_POST['action'])) {
    if ($_POST['action'] === 'add_vehicle' && wp_verify_nonce($_POST['vgc_nonce'], 'vgc_admin')) {
        $wpdb->insert(
            $wpdb->prefix . 'vgc_vehicles',
            array(
                'producer' => sanitize_text_field($_POST['producer']),
                'model' => sanitize_text_field($_POST['model']),
                'category_id' => intval($_POST['category_id']),
                'manufacturing_period' => sanitize_text_field($_POST['manufacturing_period'])
            )
        );
        echo '<div class="notice notice-success"><p>Vehicul adăugat cu succes!</p></div>';
    }
    
    if ($_POST['action'] === 'delete_vehicle' && wp_verify_nonce($_POST['vgc_nonce'], 'vgc_admin')) {
        $vehicle_id = intval($_POST['vehicle_id']);
        $wpdb->delete($wpdb->prefix . 'vgc_vehicles', array('id' => $vehicle_id));
        $wpdb->delete($wpdb->prefix . 'vgc_coverages', array('vehicle_id' => $vehicle_id));
        $wpdb->delete($wpdb->prefix . 'vgc_extra_options', array('vehicle_id' => $vehicle_id));
        echo '<div class="notice notice-success"><p>Vehicul șters cu succes!</p></div>';
    }
}

// Get data
$vehicles = $wpdb->get_results("
    SELECT v.*, c.nume as category_name 
    FROM {$wpdb->prefix}vgc_vehicles v 
    LEFT JOIN {$wpdb->prefix}vgc_categories c ON v.category_id = c.id 
    ORDER BY v.producer, v.model
");

$categories = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}vgc_categories ORDER BY nume");
?>

<div class="wrap">
    <h1>Gestionare Vehicule</h1>
    
    <!-- Add Vehicle Form -->
    <div class="vgc-admin-section">
        <h2>Adaugă Vehicul Nou</h2>
        <form method="post" class="vgc-form">
            <?php wp_nonce_field('vgc_admin', 'vgc_nonce'); ?>
            <input type="hidden" name="action" value="add_vehicle">
            
            <table class="form-table">
                <tr>
                    <th><label for="producer">Producător</label></th>
                    <td><input type="text" id="producer" name="producer" class="regular-text" required></td>
                </tr>
                <tr>
                    <th><label for="model">Model</label></th>
                    <td><input type="text" id="model" name="model" class="regular-text" required></td>
                </tr>
                <tr>
                    <th><label for="category_id">Categorie</label></th>
                    <td>
                        <select id="category_id" name="category_id">
                            <option value="">Selectează categoria</option>
                            <?php foreach ($categories as $category): ?>
                                <option value="<?php echo $category->id; ?>"><?php echo esc_html($category->nume); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="manufacturing_period">Perioada fabricație</label></th>
                    <td><input type="text" id="manufacturing_period" name="manufacturing_period" class="regular-text" placeholder="ex: 2020-2024"></td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" class="button button-primary" value="Adaugă Vehicul">
            </p>
        </form>
    </div>
    
    <!-- Vehicles List -->
    <div class="vgc-admin-section">
        <h2>Vehicule Existente (<?php echo count($vehicles); ?>)</h2>
        
        <?php if (empty($vehicles)): ?>
            <p>Nu există vehicule adăugate încă.</p>
        <?php else: ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Producător</th>
                        <th>Model</th>
                        <th>Categorie</th>
                        <th>Perioada</th>
                        <th>Acoperiri</th>
                        <th>Opțiuni</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($vehicles as $vehicle): ?>
                        <?php
                        $coverages_count = $wpdb->get_var($wpdb->prepare(
                            "SELECT COUNT(*) FROM {$wpdb->prefix}vgc_coverages WHERE vehicle_id = %d",
                            $vehicle->id
                        ));
                        $options_count = $wpdb->get_var($wpdb->prepare(
                            "SELECT COUNT(*) FROM {$wpdb->prefix}vgc_extra_options WHERE vehicle_id = %d",
                            $vehicle->id
                        ));
                        ?>
                        <tr>
                            <td><strong><?php echo esc_html($vehicle->producer); ?></strong></td>
                            <td><?php echo esc_html($vehicle->model); ?></td>
                            <td><?php echo esc_html($vehicle->category_name ?: 'Necunoscută'); ?></td>
                            <td><?php echo esc_html($vehicle->manufacturing_period ?: '-'); ?></td>
                            <td><span class="badge"><?php echo $coverages_count; ?> acoperiri</span></td>
                            <td><span class="badge"><?php echo $options_count; ?> opțiuni</span></td>
                            <td>
                                <a href="<?php echo admin_url('admin.php?page=vgc-vehicle-details&id=' . $vehicle->id); ?>" 
                                   class="button button-small">Editează</a>
                                
                                <form method="post" style="display: inline;" 
                                      onsubmit="return confirm('Ești sigur că vrei să ștergi acest vehicul?');">
                                    <?php wp_nonce_field('vgc_admin', 'vgc_nonce'); ?>
                                    <input type="hidden" name="action" value="delete_vehicle">
                                    <input type="hidden" name="vehicle_id" value="<?php echo $vehicle->id; ?>">
                                    <input type="submit" class="button button-small button-link-delete" value="Șterge">
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>

<style>
.vgc-admin-section {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 1px 1px rgba(0,0,0,.04);
}

.vgc-form .form-table th {
    width: 150px;
}

.badge {
    background: #0073aa;
    color: white;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
}

.button-link-delete {
    color: #a00 !important;
}

.button-link-delete:hover {
    color: #dc3232 !important;
}
</style>
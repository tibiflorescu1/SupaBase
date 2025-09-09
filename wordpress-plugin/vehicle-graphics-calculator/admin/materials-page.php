<?php
if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

// Handle form submissions
if (isset($_POST['action'])) {
    if ($_POST['action'] === 'add_print_material' && wp_verify_nonce($_POST['vgc_nonce'], 'vgc_admin')) {
        $wpdb->insert(
            $wpdb->prefix . 'vgc_print_materials',
            array(
                'name' => sanitize_text_field($_POST['name']),
                'calculation_type' => sanitize_text_field($_POST['calculation_type']),
                'value' => floatval($_POST['value']),
                'allows_white_print' => isset($_POST['allows_white_print']) ? 1 : 0
            )
        );
        echo '<div class="notice notice-success"><p>Material print adăugat cu succes!</p></div>';
    }
    
    if ($_POST['action'] === 'add_lamination_material' && wp_verify_nonce($_POST['vgc_nonce'], 'vgc_admin')) {
        $wpdb->insert(
            $wpdb->prefix . 'vgc_lamination_materials',
            array(
                'name' => sanitize_text_field($_POST['name']),
                'calculation_type' => sanitize_text_field($_POST['calculation_type']),
                'value' => floatval($_POST['value'])
            )
        );
        echo '<div class="notice notice-success"><p>Material laminare adăugat cu succes!</p></div>';
    }
    
    if ($_POST['action'] === 'update_white_print' && wp_verify_nonce($_POST['vgc_nonce'], 'vgc_admin')) {
        $existing = $wpdb->get_row("SELECT id FROM {$wpdb->prefix}vgc_white_print_settings LIMIT 1");
        
        $data = array(
            'calculation_type' => sanitize_text_field($_POST['calculation_type']),
            'value' => floatval($_POST['value'])
        );
        
        if ($existing) {
            $wpdb->update($wpdb->prefix . 'vgc_white_print_settings', $data, array('id' => $existing->id));
        } else {
            $wpdb->insert($wpdb->prefix . 'vgc_white_print_settings', $data);
        }
        
        echo '<div class="notice notice-success"><p>Setări print alb actualizate cu succes!</p></div>';
    }
}

// Get data
$print_materials = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}vgc_print_materials ORDER BY name");
$lamination_materials = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}vgc_lamination_materials ORDER BY name");
$white_print_settings = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}vgc_white_print_settings LIMIT 1");
?>

<div class="wrap">
    <h1>Gestionare Materiale</h1>
    
    <!-- Print Materials -->
    <div class="vgc-admin-section">
        <h2>Materiale Print</h2>
        
        <form method="post" class="vgc-form">
            <?php wp_nonce_field('vgc_admin', 'vgc_nonce'); ?>
            <input type="hidden" name="action" value="add_print_material">
            
            <table class="form-table">
                <tr>
                    <th><label for="print_name">Nume Material</label></th>
                    <td><input type="text" id="print_name" name="name" class="regular-text" required></td>
                </tr>
                <tr>
                    <th><label for="print_calculation_type">Tip Calcul</label></th>
                    <td>
                        <select id="print_calculation_type" name="calculation_type" required>
                            <option value="percentage">Procentual</option>
                            <option value="fixed_amount">Sumă Fixă</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="print_value">Valoare</label></th>
                    <td><input type="number" id="print_value" name="value" step="0.01" min="0" class="regular-text" required></td>
                </tr>
                <tr>
                    <th><label for="allows_white_print">Permite Print Alb</label></th>
                    <td><input type="checkbox" id="allows_white_print" name="allows_white_print" value="1"></td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" class="button button-primary" value="Adaugă Material Print">
            </p>
        </form>
        
        <?php if (!empty($print_materials)): ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Nume</th>
                        <th>Tip Calcul</th>
                        <th>Valoare</th>
                        <th>Print Alb</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($print_materials as $material): ?>
                        <tr>
                            <td><strong><?php echo esc_html($material->name); ?></strong></td>
                            <td><?php echo $material->calculation_type === 'percentage' ? 'Procentual' : 'Sumă Fixă'; ?></td>
                            <td><?php echo $material->value; ?> <?php echo $material->calculation_type === 'percentage' ? '%' : 'RON'; ?></td>
                            <td><?php echo $material->allows_white_print ? '✅ Da' : '❌ Nu'; ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
    
    <!-- Lamination Materials -->
    <div class="vgc-admin-section">
        <h2>Materiale Laminare</h2>
        
        <form method="post" class="vgc-form">
            <?php wp_nonce_field('vgc_admin', 'vgc_nonce'); ?>
            <input type="hidden" name="action" value="add_lamination_material">
            
            <table class="form-table">
                <tr>
                    <th><label for="lamination_name">Nume Material</label></th>
                    <td><input type="text" id="lamination_name" name="name" class="regular-text" required></td>
                </tr>
                <tr>
                    <th><label for="lamination_calculation_type">Tip Calcul</label></th>
                    <td>
                        <select id="lamination_calculation_type" name="calculation_type" required>
                            <option value="percentage">Procentual</option>
                            <option value="fixed_amount">Sumă Fixă</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="lamination_value">Valoare</label></th>
                    <td><input type="number" id="lamination_value" name="value" step="0.01" min="0" class="regular-text" required></td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" class="button button-primary" value="Adaugă Material Laminare">
            </p>
        </form>
        
        <?php if (!empty($lamination_materials)): ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Nume</th>
                        <th>Tip Calcul</th>
                        <th>Valoare</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($lamination_materials as $material): ?>
                        <tr>
                            <td><strong><?php echo esc_html($material->name); ?></strong></td>
                            <td><?php echo $material->calculation_type === 'percentage' ? 'Procentual' : 'Sumă Fixă'; ?></td>
                            <td><?php echo $material->value; ?> <?php echo $material->calculation_type === 'percentage' ? '%' : 'RON'; ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
    
    <!-- White Print Settings -->
    <div class="vgc-admin-section">
        <h2>Setări Print Alb</h2>
        
        <form method="post" class="vgc-form">
            <?php wp_nonce_field('vgc_admin', 'vgc_nonce'); ?>
            <input type="hidden" name="action" value="update_white_print">
            
            <table class="form-table">
                <tr>
                    <th><label for="white_calculation_type">Tip Calcul</label></th>
                    <td>
                        <select id="white_calculation_type" name="calculation_type" required>
                            <option value="percentage" <?php selected($white_print_settings->calculation_type ?? 'percentage', 'percentage'); ?>>Procentual</option>
                            <option value="fixed_amount" <?php selected($white_print_settings->calculation_type ?? '', 'fixed_amount'); ?>>Sumă Fixă</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="white_value">Valoare</label></th>
                    <td><input type="number" id="white_value" name="value" step="0.01" min="0" 
                              value="<?php echo $white_print_settings->value ?? 35; ?>" class="regular-text" required></td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" class="button button-primary" value="Actualizează Setări">
            </p>
        </form>
        
        <?php if ($white_print_settings): ?>
            <div class="vgc-current-settings">
                <h4>Setări Curente:</h4>
                <p><strong>Tip:</strong> <?php echo $white_print_settings->calculation_type === 'percentage' ? 'Procentual' : 'Sumă Fixă'; ?></p>
                <p><strong>Valoare:</strong> <?php echo $white_print_settings->value; ?> <?php echo $white_print_settings->calculation_type === 'percentage' ? '%' : 'RON'; ?></p>
            </div>
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

.vgc-current-settings {
    background: #f0f6fc;
    border: 1px solid #c3d9ff;
    border-radius: 4px;
    padding: 15px;
    margin-top: 20px;
}

.vgc-current-settings h4 {
    margin-top: 0;
    color: #0073aa;
}
</style>
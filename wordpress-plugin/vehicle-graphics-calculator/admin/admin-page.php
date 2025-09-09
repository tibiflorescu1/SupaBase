<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1>Vehicle Graphics Calculator</h1>
    
    <div class="vgc-admin-dashboard">
        <div class="vgc-admin-cards">
            <div class="vgc-admin-card">
                <h3>📊 Statistici</h3>
                <?php
                global $wpdb;
                $vehicles_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}vgc_vehicles");
                $categories_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}vgc_categories");
                $coverages_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}vgc_coverages");
                $options_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}vgc_extra_options");
                ?>
                <ul>
                    <li><strong>Vehicule:</strong> <?php echo $vehicles_count; ?></li>
                    <li><strong>Categorii:</strong> <?php echo $categories_count; ?></li>
                    <li><strong>Acoperiri:</strong> <?php echo $coverages_count; ?></li>
                    <li><strong>Opțiuni extra:</strong> <?php echo $options_count; ?></li>
                </ul>
            </div>
            
            <div class="vgc-admin-card">
                <h3>🚀 Utilizare</h3>
                <p>Pentru a afișa calculatorul pe o pagină, folosește shortcode-ul:</p>
                <code>[vehicle_calculator]</code>
                
                <h4>Opțiuni shortcode:</h4>
                <ul>
                    <li><code>show_title="false"</code> - ascunde titlul</li>
                    <li><code>theme="custom"</code> - temă personalizată</li>
                </ul>
                
                <p><strong>Exemplu:</strong></p>
                <code>[vehicle_calculator show_title="false" theme="custom"]</code>
            </div>
            
            <div class="vgc-admin-card">
                <h3>🛒 WooCommerce</h3>
                <?php if (class_exists('WooCommerce')): ?>
                    <p style="color: green;">✅ WooCommerce este activ</p>
                    <p>Calculatorul va permite adăugarea produselor în coș.</p>
                <?php else: ?>
                    <p style="color: red;">❌ WooCommerce nu este activ</p>
                    <p>Pentru funcționalitatea de coș, instalează și activează WooCommerce.</p>
                <?php endif; ?>
            </div>
            
            <div class="vgc-admin-card">
                <h3>⚙️ Acțiuni rapide</h3>
                <p>
                    <a href="<?php echo admin_url('admin.php?page=vgc-vehicles'); ?>" class="button button-primary">
                        Gestionează Vehicule
                    </a>
                </p>
                <p>
                    <a href="<?php echo admin_url('admin.php?page=vgc-materials'); ?>" class="button button-secondary">
                        Gestionează Materiale
                    </a>
                </p>
            </div>
        </div>
    </div>
</div>

<style>
.vgc-admin-dashboard {
    margin-top: 20px;
}

.vgc-admin-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.vgc-admin-card {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 1px 1px rgba(0,0,0,.04);
}

.vgc-admin-card h3 {
    margin-top: 0;
    color: #23282d;
}

.vgc-admin-card ul {
    list-style: none;
    padding: 0;
}

.vgc-admin-card li {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
}

.vgc-admin-card code {
    background: #f1f1f1;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: Consolas, Monaco, monospace;
}
</style>
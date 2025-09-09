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
                $supabase = new VGC_Supabase_Client();
                $data = $supabase->get_calculator_data();
                
                if (is_wp_error($data)) {
                    echo '<p style="color: red;">❌ Nu s-a putut conecta la Supabase</p>';
                    echo '<p><a href="' . admin_url('admin.php?page=vgc-supabase') . '">Configurează conexiunea</a></p>';
                } else {
                    $vehicles_count = count($data['vehicles']);
                    $categories_count = count($data['categories']);
                    $coverages_count = 0;
                    $options_count = 0;
                    
                    foreach ($data['vehicles'] as $vehicle) {
                        $coverages_count += count($vehicle['coverages']);
                        $options_count += count($vehicle['extra_options']);
                    }
                ?>
                <ul>
                    <li><strong>Vehicule:</strong> <?php echo $vehicles_count; ?></li>
                    <li><strong>Categorii:</strong> <?php echo $categories_count; ?></li>
                    <li><strong>Acoperiri:</strong> <?php echo $coverages_count; ?></li>
                    <li><strong>Opțiuni extra:</strong> <?php echo $options_count; ?></li>
                </ul>
                <?php } ?>
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
                <h3>🔗 Conexiuni</h3>
                <?php
                $supabase_url = get_option('vgc_supabase_url', '');
                $supabase_key = get_option('vgc_supabase_key', '');
                ?>
                
                <h4>Supabase</h4>
                <?php if (!empty($supabase_url) && !empty($supabase_key)): ?>
                    <p style="color: green;">✅ Supabase configurat</p>
                    <p><a href="<?php echo admin_url('admin.php?page=vgc-supabase'); ?>">Gestionează setările</a></p>
                <?php else: ?>
                    <p style="color: red;">❌ Supabase nu este configurat</p>
                    <p><a href="<?php echo admin_url('admin.php?page=vgc-supabase'); ?>" class="button button-primary">Configurează acum</a></p>
                <?php endif; ?>
                
                <h4>WooCommerce</h4>
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
                    <a href="<?php echo admin_url('admin.php?page=vgc-supabase'); ?>" class="button button-primary">
                        Configurează Supabase
                    </a>
                </p>
                <p>
                    <a href="<?php echo admin_url('shortcode='); ?>" class="button button-secondary">
                        Testează Calculator
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
<?php
if (!defined('ABSPATH')) {
    exit;
}

// Handle form submission
if (isset($_POST['submit']) && wp_verify_nonce($_POST['vgc_nonce'], 'vgc_supabase_settings')) {
    update_option('vgc_supabase_url', sanitize_url($_POST['supabase_url']));
    update_option('vgc_supabase_key', sanitize_text_field($_POST['supabase_key']));
    
    echo '<div class="notice notice-success"><p>Setările Supabase au fost salvate cu succes!</p></div>';
    
    // Test connection
    $supabase = new VGC_Supabase_Client();
    if ($supabase->test_connection()) {
        echo '<div class="notice notice-success"><p>✅ Conexiunea la Supabase funcționează!</p></div>';
    } else {
        echo '<div class="notice notice-error"><p>❌ Nu s-a putut conecta la Supabase. Verifică setările.</p></div>';
    }
}

$supabase_url = get_option('vgc_supabase_url', '');
$supabase_key = get_option('vgc_supabase_key', '');
?>

<div class="wrap">
    <h1>Setări Supabase</h1>
    
    <div class="vgc-admin-section">
        <h2>Configurare Conexiune Supabase</h2>
        <p>Conectează plugin-ul la baza de date Supabase pentru a prelua datele vehiculelor.</p>
        
        <form method="post" class="vgc-form">
            <?php wp_nonce_field('vgc_supabase_settings', 'vgc_nonce'); ?>
            
            <table class="form-table">
                <tr>
                    <th><label for="supabase_url">Supabase URL</label></th>
                    <td>
                        <input type="url" id="supabase_url" name="supabase_url" 
                               value="<?php echo esc_attr($supabase_url); ?>" 
                               class="regular-text" required
                               placeholder="https://your-project.supabase.co">
                        <p class="description">URL-ul proiectului tău Supabase (găsești în Settings → API)</p>
                    </td>
                </tr>
                <tr>
                    <th><label for="supabase_key">Supabase Anon Key</label></th>
                    <td>
                        <input type="text" id="supabase_key" name="supabase_key" 
                               value="<?php echo esc_attr($supabase_key); ?>" 
                               class="regular-text" required
                               placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                        <p class="description">Cheia publică (anon/public) din Settings → API</p>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" name="submit" class="button button-primary" value="Salvează Setări">
            </p>
        </form>
    </div>
    
    <?php if (!empty($supabase_url) && !empty($supabase_key)): ?>
    <div class="vgc-admin-section">
        <h2>Test Conexiune</h2>
        <?php
        $supabase = new VGC_Supabase_Client();
        $data = $supabase->get_calculator_data();
        
        if (is_wp_error($data)): ?>
            <div class="notice notice-error inline">
                <p><strong>❌ Eroare conexiune:</strong> <?php echo esc_html($data->get_error_message()); ?></p>
            </div>
        <?php else: ?>
            <div class="notice notice-success inline">
                <p><strong>✅ Conexiune reușită!</strong></p>
            </div>
            
            <div class="vgc-stats">
                <h3>📊 Date disponibile:</h3>
                <ul>
                    <li><strong>Categorii:</strong> <?php echo count($data['categories']); ?></li>
                    <li><strong>Vehicule:</strong> <?php echo count($data['vehicles']); ?></li>
                    <li><strong>Materiale Print:</strong> <?php echo count($data['print_materials']); ?></li>
                    <li><strong>Materiale Laminare:</strong> <?php echo count($data['lamination_materials']); ?></li>
                </ul>
            </div>
        <?php endif; ?>
    </div>
    <?php endif; ?>
    
    <div class="vgc-admin-section">
        <h2>📋 Instrucțiuni</h2>
        <ol>
            <li><strong>Accesează Supabase Dashboard</strong> - <a href="https://supabase.com/dashboard" target="_blank">supabase.com/dashboard</a></li>
            <li><strong>Selectează proiectul</strong> cu datele vehiculelor</li>
            <li><strong>Mergi la Settings → API</strong></li>
            <li><strong>Copiază URL-ul</strong> din secțiunea "Project URL"</li>
            <li><strong>Copiază cheia</strong> din secțiunea "Project API keys" → "anon public"</li>
            <li><strong>Completează formularul</strong> de mai sus și salvează</li>
        </ol>
        
        <div class="vgc-warning">
            <p><strong>⚠️ Important:</strong></p>
            <ul>
                <li>Folosește doar <strong>anon/public key</strong>, nu service_role key</li>
                <li>Asigură-te că <strong>Row Level Security</strong> este configurat corect</li>
                <li>Verifică că tabelele <code>vehicule</code>, <code>categorii</code>, etc. există</li>
            </ul>
        </div>
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

.vgc-stats {
    background: #f0f6fc;
    border: 1px solid #c3d9ff;
    border-radius: 4px;
    padding: 15px;
    margin-top: 15px;
}

.vgc-stats h3 {
    margin-top: 0;
    color: #0073aa;
}

.vgc-stats ul {
    list-style: none;
    padding: 0;
}

.vgc-stats li {
    padding: 5px 0;
    border-bottom: 1px solid #e1e8ed;
}

.vgc-warning {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 15px;
    margin-top: 15px;
}

.vgc-warning p {
    margin-top: 0;
    color: #856404;
    font-weight: bold;
}

.vgc-warning ul {
    color: #856404;
}

.notice.inline {
    margin: 15px 0;
}
</style>
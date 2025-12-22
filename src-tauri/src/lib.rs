use tauri::{Window};

#[tauri::command]
async fn toggle_mini_mode(window: Window, is_mini: bool) {
    if is_mini {
        // 开启 Mini 模式: 变小、置顶、无边框
        window.set_always_on_top(true).unwrap();
        // 设置一个小尺寸，例如 200x120
        window.set_size(tauri::Size::Logical(tauri::LogicalSize { width: 200.0, height: 120.0 })).unwrap();
    } else {
        // 恢复主窗口模式
        window.set_always_on_top(false).unwrap();
        // 恢复大尺寸，例如 800x600
        window.set_size(tauri::Size::Logical(tauri::LogicalSize { width: 800.0, height: 600.0 })).unwrap();
        // 窗口居中
        window.center().unwrap();
        // 恢复焦点
        window.set_focus().unwrap();
    }
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![toggle_mini_mode])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tokio::main]
async fn main() {
    let db = aura_lib::init_db()
        .await
        .expect("Failed to initialize database");
    aura_lib::run(db)
}

use crate::constant::constants;
use crate::migration::Migrator;
use sea_orm::{Database, DatabaseConnection, DbErr};
use sea_orm_migration::{MigratorTrait, SchemaManager};
use std::fs;
use crate::command::{complete_task_in_db, create_task, delete_task_in_db, get_all_tasks, toggle_mini_mode, update_task_in_db};

mod command;
pub mod constant;
mod migration;
mod model;

pub fn run(db: DatabaseConnection) {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .manage(db) // 将数据库连接存入 Tauri 状态管理
        .invoke_handler(tauri::generate_handler![
            toggle_mini_mode,
            create_task,
            get_all_tasks,
            complete_task_in_db,
            update_task_in_db,
            delete_task_in_db,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub async fn init_db() -> Result<DatabaseConnection, DbErr> {
    let db_path = constants::get_db_path();

    // 确保目录存在
    if let Some(parent) = db_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).expect("创建目录失败");
        }
    }

    // File::create(&db_path).expect("创建数据库文件失败");
    let db_url = format!("sqlite://{}?mode=rwc", db_path.display());
    let db = Database::connect(&db_url).await?;

    // 初始化数据表
    let schema_manager = SchemaManager::new(&db);
    Migrator::up(&db, None).await?;
    assert!(schema_manager.has_table("task").await?);
    Ok(db)
}

use crate::model::prelude::Task;
use crate::model::task;
use sea_orm::sqlx::types::chrono;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, Set,
};
use tauri::{State, Window};

#[tauri::command]
pub async fn create_task(
    db: State<'_, DatabaseConnection>,
    title: String,
    duration: i32,
    mode: String,
    break_duration: i32,
    tags: Vec<String>,
    est: i32,
) -> Result<i32, String> {
    // 当前系统时间
    let now = chrono::Utc::now();

    // 构建实体
    let new_task = task::ActiveModel {
        title: Set(title),
        duration: Set(duration),
        mode: Set(mode),
        is_completed: Set(false), // 默认未完成
        break_duration: Set(break_duration),
        tags: Set(serde_json::json!(tags)),
        act: Set(0),
        est: Set(est),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default() // ID 自增，其他字段默认
    };

    // 执行插入
    let res = new_task
        .insert(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    // 返回新生成的 ID
    Ok(res.id)
}

// 2. 获取所有任务
#[tauri::command]
pub async fn get_all_tasks(
    db: State<'_, DatabaseConnection>,
    exclude_completed: bool, // 是否过滤数据
) -> Result<Vec<task::Model>, String> {
    // 构建查询器
    let mut query = task::Entity::find();

    // 如果前端说“我不要已完成的”，后端就把它过滤掉
    if exclude_completed {
        query = query.filter(task::Column::IsCompleted.eq(false));
    }

    // 按创建时间倒序
    let tasks = query
        .order_by_desc(task::Column::CreatedAt)
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(tasks)
}

// 3. 更新任务状态
#[tauri::command]
pub async fn complete_task_in_db(db: State<'_, DatabaseConnection>, id: i32) -> Result<(), String> {
    // 先按 ID 查出来，转换成 ActiveModel
    let task = Task::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    if let Some(task) = task {
        let mut active: task::ActiveModel = task.into();
        active.is_completed = Set(true);
        active.updated_at = Set(chrono::Utc::now());
        active.update(db.inner()).await.map_err(|e| e.to_string())?;
    }

    Ok(())
}

// 更新任务
#[tauri::command]
pub async fn update_task_in_db(
    db: State<'_, DatabaseConnection>,
    id: i32,
    title: String,
    duration: i32,
    mode: String,
    break_duration: i32,
    tags: Vec<String>,
    est: i32,
) -> Result<(), String> {
    let task = task::Entity::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    if let Some(task) = task {
        let mut active: task::ActiveModel = task.into();
        active.title = Set(title);
        active.duration = Set(duration);
        active.mode = Set(mode);
        active.break_duration = Set(break_duration);
        active.tags = Set(serde_json::json!(tags));
        active.est = Set(est);
        active.updated_at = Set(chrono::Utc::now());

        active.update(db.inner()).await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

// 删除任务
#[tauri::command]
pub async fn delete_task_in_db(db: State<'_, DatabaseConnection>, id: i32) -> Result<(), String> {
    task::Entity::delete_by_id(id)
        .exec(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn toggle_mini_mode(window: Window, is_mini: bool) {
    if is_mini {
        // 开启 Mini 模式: 变小、置顶、无边框
        window.set_always_on_top(true).unwrap();
        // 设置一个小尺寸，例如 200x120
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 200.0,
                height: 120.0,
            }))
            .unwrap();
    } else {
        // 恢复主窗口模式
        window.set_always_on_top(false).unwrap();
        // 恢复大尺寸，例如 800x600
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 800.0,
                height: 600.0,
            }))
            .unwrap();
        // 窗口居中
        window.center().unwrap();
        // 恢复焦点
        window.set_focus().unwrap();
    }
}

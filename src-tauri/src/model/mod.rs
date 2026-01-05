use sea_orm::DbConn;
use tokio::sync::OnceCell;
use crate::constant::constants;

pub mod task;
pub static DB_CONN: OnceCell<DbConn> = OnceCell::const_new();

pub async fn start_db() {
    let db_path = constants::get_db_path();
    DB_CONN
        .get_or_init(|| async {
            sea_orm::Database::connect(format!("sqlite://{}", db_path.display()))
                .await
                .expect("数据库连接失败")
        })
        .await;
}

pub fn get_db() -> &'static DbConn {
    DB_CONN.get().unwrap()
}
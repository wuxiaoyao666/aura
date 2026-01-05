use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Serialize, DeriveEntityModel, Eq)]
// 驼峰命名转下划线
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "task")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub title: String,
    pub duration: i32, // 初始设定时长
    pub mode: String,  // "timer" | "stopwatch"
    pub is_completed: bool,
    pub break_duration: i32,
    #[sea_orm(column_type = "Json")]
    pub tags: serde_json::Value,
    pub act: i32,
    pub est: i32,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

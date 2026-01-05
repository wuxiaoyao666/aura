use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
    fn name(&self) -> &str {
        "create_task_table"
    }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Task::Table)
                    .col(
                        ColumnDef::new(Task::Id)
                            .big_integer()
                            .not_null()
                            .primary_key()
                            .auto_increment(),
                    )
                    .col(ColumnDef::new(Task::Title).string().not_null())
                    .col(ColumnDef::new(Task::Duration).integer())
                    .col(ColumnDef::new(Task::Mode).string().not_null())
                    .col(ColumnDef::new(Task::IsCompleted).boolean().not_null())
                    .col(ColumnDef::new(Task::BreakDuration).integer().not_null())
                    .col(ColumnDef::new(Task::Tags).string()) // SQLite存JSON通常用String/Text
                    .col(ColumnDef::new(Task::Act).integer().not_null().default(0))
                    .col(ColumnDef::new(Task::Est).integer().not_null().default(1))
                    .col(ColumnDef::new(Task::CreatedAt).date_time().not_null())
                    .col(ColumnDef::new(Task::UpdatedAt).date_time().not_null())
                    .to_owned(),
            )
            .await
    }
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Task::Table).to_owned())
            .await
    }
}

#[derive(Iden)]
pub enum Task {
    Table,
    Id,
    Title,
    Duration,
    Mode,
    IsCompleted,
    BreakDuration,
    Tags,
    Act,
    Est,
    CreatedAt,
    UpdatedAt
}
pub mod constants{
    use std::path::PathBuf;
    use dirs::home_dir;

    pub(crate) fn get_db_path() -> PathBuf {
        let mut path = home_dir().expect("无法获取用户目录");
        path.push("aura"); //
        path.push("data.db");
        path
    }

}
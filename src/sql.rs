use anyhow::Result;
use rusqlite::Connection;

pub struct DB {
    conn: Connection,
}

impl DB {
    pub fn new(db_file: &str) -> Result<Self> {
        let db = DB {
            conn: Connection::open(db_file)?,
        };

        let cmd = std::include_str!("sql/create.sql");
        db.conn.execute_batch(&cmd)?;

        Ok(db)
    }
}

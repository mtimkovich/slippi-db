use anyhow::Result;
use rusqlite::Connection;

pub fn create_tables() -> Result<()> {
    let conn = Connection::open("slippi.db")?;
    let cmd = std::include_str!("sql/create.sql");

    conn.execute(&cmd, [])?;

    Ok(())
}

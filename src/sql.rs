use crate::GameEntry;
use anyhow::Result;
use rusqlite::{params, Connection};

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

    pub fn insert_entries(&mut self, entries: &Vec<GameEntry>) -> Result<u32> {
        let tx = self.conn.transaction()?;
        let mut inserts = 0;

        for entry in entries {
            let result = tx.execute(
                "insert into games
                (filepath, is_teams, duration, start_time, stage)
                values (?, ?, ?, ?, ?)",
                params![
                    entry.filepath,
                    entry.is_teams,
                    entry.duration,
                    entry.start_time,
                    entry.stage,
                ],
            );

            match result {
                Ok(_) => inserts += 1,
                Err(e) => eprintln!("{}: {}", e, entry.filepath),
            }
        }

        tx.commit()?;
        Ok(inserts)
    }
}

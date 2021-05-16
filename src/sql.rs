use crate::{GameEntry, Player};
use anyhow::Result;
use rusqlite::{params, Connection, Transaction};
use std::collections::HashSet;
use std::path::PathBuf;

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

    pub fn compare_filepaths(&self, files: &Vec<PathBuf>) -> Result<Vec<String>> {
        let fileset: HashSet<_> = files.into_iter().map(|f| f.display().to_string()).collect();
        Ok(fileset
            .difference(&self.get_filepaths()?)
            .cloned()
            .collect())
    }

    fn get_filepaths(&self) -> Result<HashSet<String>> {
        let mut stmt = self.conn.prepare("select filepath from games")?;
        let rows = stmt.query_map([], |row| row.get(0))?;
        Ok(rows.filter_map(|r| r.ok()).collect())
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

            if let Some(e) = result.err() {
                warn!("{}: {}", e, entry.filepath);
                continue;
            }

            let result = insert_players(&tx, &entry.players, tx.last_insert_rowid());

            match result {
                Ok(_) => inserts += 1,
                Err(e) => warn!("{}: {}", e, entry.filepath),
            }
        }

        tx.commit()?;
        Ok(inserts)
    }
}

fn insert_players(tx: &Transaction, players: &Vec<Player>, game_id: i64) -> Result<()> {
    for player in players {
        let result = tx.execute(
            "insert into players (game_id, tag, code, port, stocks, damage)
                values (?, ?, ?, ?, ?, ?)",
            params![
                game_id,
                player.tag,
                player.code,
                player.port,
                player.stocks,
                player.damage,
            ],
        );

        if let Some(err) = result.err() {
            warn!("{}", err);
        }
    }

    Ok(())
}

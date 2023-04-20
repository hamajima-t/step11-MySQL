// STEP11: 集計ページの作成

package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"step11-mysql/conf" // 実装した設定パッケージの読み込み

	_ "github.com/go-sql-driver/mysql"
)

func main() {

	// 設定ファイルを読み込む
	confDB, err := conf.ReadConfDB()
	if err != nil {
		fmt.Println(err.Error())
	}

	// 設定値から接続文字列を生成
	conStr := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s",
		confDB.User,
		confDB.Pass,
		confDB.Host,
		confDB.Port,
		confDB.DbName)

	fmt.Println(confDB.DbName)

	// データベースへ接続
	db, err := sql.Open("mysql", conStr)
	if err != nil {
		log.Fatal(err)
	}

	// AccountBookをNewAccountBookを使って作成
	ab := NewAccountBook(db)

	// テーブルを作成
	if err := ab.CreateTable(); err != nil {
		log.Fatal(err)
	}

	// HandlersをNewHandlersを使って作成
	hs := NewHandlers(ab)

	// ハンドラの登録
	http.HandleFunc("/", hs.ListHandler)
	http.HandleFunc("/ws", hs.WsEndpoint)
	http.HandleFunc("/save", hs.SaveHandler)
	http.HandleFunc("/summary", hs.SummaryHandler)

	// 静的ファイル（JavaScript/CSS）を読み込むために
	// ファイルサーバーを起動する
	fileServer := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static", fileServer))

	go hs.ListenToWsChannel()

	fmt.Println("http://localhost:8080 で起動中...")
	// HTTPサーバを起動する
	log.Fatal(http.ListenAndServe(":8080", nil))
}

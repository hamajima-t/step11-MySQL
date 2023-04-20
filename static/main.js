(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const socket = setupWebSocket();

    // 削除
    const items = document.querySelector('#items');
    items.addEventListener('click', (e) => {
      deleteItem(e.target, socket);
    });
  });

  function setupWebSocket() {
    // WebSocketオブジェクトの作成
    const socket = new WebSocket("ws://127.0.0.1:8080/ws");
    // 接続を確立
    socket.addEventListener('open', () => {
      console.log("Successfully connected!");
    });

    // WebSocketからデータを受け取りDOMを更新する
    socket.addEventListener('message', msg => {
      const data = JSON.parse(msg.data);
      switch (data.Action) {
        case "delete":
          const tbodies = document.getElementsByTagName('tbody');
          const heading = document.getElementById('latest10');
          updateTable(tbodies, data);
          updateHeading(heading,
            `最新${data.Items.length}件(<a href="/summary">集計</a>)`
          );    
            
          break;
      }
    });

    return socket;
  }

  function deleteItem(target, socket) {
    const row = target.closest('tr');
    const id = parseInt(row.dataset.id);
    const jsonData = {
      action: 'delete',
      id: id
    };
    socket.send(JSON.stringify(jsonData));
    row.style.display = 'none';
  }

  function updateTable(tbodies, data) {
    // bodyの内容を全て削除する
    while (tbodies[0].firstChild) {
      tbodies[0].removeChild(tbodies[0].firstChild);
    }

    // DBにデータがあれば、bodyの内容を作成する
    if (data.Items.length > 0) {
      Object.keys(data.Items).forEach(function(index) {
        const tr = document.createElement('tr');
        tr.dataset.id = data.Items[index].ID;
        Object.keys(data.Items[index]).forEach(function(key) {
          if (key !== "ID") {
            const td = document.createElement('td');
            const textNode = document.createTextNode(data.Items[index][key]);
            td.appendChild(textNode);
            tr.appendChild(td);
          }
        });

        const td = document.createElement('td');
        const textNode = document.createTextNode("x");
        td.setAttribute("class", "delete_item");
        td.appendChild(textNode);
        tr.appendChild(td);

        tbodies[0].appendChild(tr);
      });
    }
  }

  function updateHeading(heading, text) {
    heading.innerHTML = text;
  }

})();
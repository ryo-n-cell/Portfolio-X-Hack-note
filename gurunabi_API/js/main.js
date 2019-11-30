$(document).foundation();

// 本来はサーバー側で処理してユーザーからは見えないようにする
const API_KEY = "//秘密💛";
const MAIN_BLOCK = document.getElementById("main-block");
//お気に入りリストの処理クラス
class FavoriteShops {

  constructor(){
    this.FAVORITE_SHOPS_KEY = "favorite_shops";
    this.favorite_shops = localStorage.getItem(this.FAVORITE_SHOPS_KEY);
    //!は否定演算子
    if (!this.favorite_shops) {
      this.favorite_shops = [];
    } else {
      this.favorite_shops = this.favorite_shops.split(",");
    }
  }

  // 引数に与えられたデータを配列に追加する処理
  add(id) {
    // 早期リターン early return
    if (this.favorite_shops.includes(id)) return;

    this.favorite_shops.push(id);
    localStorage.setItem(this.FAVORITE_SHOPS_KEY, this.favorite_shops);
  }

  // 引数に与えられたデータを配列から削除する処理
  remove(id){
    this.favorite_shops = this.favorite_shops.filter((item) => {
      if (item != id) return item;
    });
    localStorage.setItem(this.FAVORITE_SHOPS_KEY, this.favorite_shops);
  }
}
let favshops = new FavoriteShops();



// API 呼び出しの関数
function loadUrl() {
  // 全ての子要素を削除する
  while (MAIN_BLOCK.firstChild) MAIN_BLOCK.removeChild(MAIN_BLOCK.firstChild);
  // 検索ワードを取得する
  let searchData = document.getElementById("search-id").value;
  let url = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${API_KEY}&freeword=${searchData}`;
  sendRequest(url);
}


//お気に入り機能を見せる
//ローカルストレージ(favorite_shops)内のIdを取得
//→取得したfavorite_shopsをfor繰り返しリクエストする
//→各お気に入り店のIdを入れたURLをfunction sendRequestで処理してMAIN_BLOCKで表示
function favoriteList(){
  while (MAIN_BLOCK.firstChild) MAIN_BLOCK.removeChild(MAIN_BLOCK.firstChild);
  for (let i = 0;i < favshops.favorite_shops.length; i++){
    let url = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${API_KEY}&freeword=${favshops.favorite_shops[i]}`;
    sendRequest(url);
  }
}

function sendRequest(request_url) {
  // Ajax(XMLHttpRequest)処理
  // APIを実行して結果のJSONデータを加工している
 let xhttp = new XMLHttpRequest();
 // 通信が終わった時の処理
 xhttp.onload = function () {
   let res = JSON.parse(xhttp.responseText);
   for (let i = 0; i < res.rest.length; i++) {
    let card = new CardItem(res.rest[i]);
    MAIN_BLOCK.appendChild(card.node);
   }
 };
 // データ取得開始
 xhttp.open("GET", request_url, true);
 xhttp.send();
}


// カードブロックのクラス
// レストランの1店舗の情報が集約されたクラス
class CardItem {
  constructor(item) {
    this.id = item.id;
    this.node = document.createElement("div");
    this.node.classList.add("column");
    this.node.innerHTML = this.card_item(
      item.name,
      item.pr.pr_short,
      item.image_url.shop_image1,
      item.address,
    );
    this.fav_icon = this.node.querySelector(".favorite");
    // お気に入りリストに存在するか？
    if (favshops.favorite_shops.includes(this.id)) {
      this.fav_icon.classList.add("on");
    }
    // クリックした時の処理
    this.fav_icon.onclick = function () {
      let id = this.getAttribute("data-id");
      if (this.classList.contains("on")) {
        this.classList.remove("on");
        favshops.remove(id);
      } else {
        this.classList.add("on");
        favshops.add(id);
      }
    }
    // 要素のカスタム属性(HTML5カスタムデータ属性)に識別子をセットする
    this.fav_icon.setAttribute("data-id", this.id);
  }

  card_item(title, text, image, address) {
    return `
      <div class="card" style="width: 300px;">
        <div class="card-divider">
          ${title}
        </div>
        <div class="sample-box">
          <img class="image" src="${image}">
          <div class="favorite">
            <i class="fa fa-star"></i>
          </div>
        </div>
        <div class="card-section">
          <p>${text}</p>
          <p>${address}</p>
        </div>
      </div>
    `;
  }
}
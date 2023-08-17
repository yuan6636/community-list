// 串接 API 的網址
const BASE_URL = 'https://user-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/users/';

// 尋找節點
const userContainer = document.querySelector('.user-container');
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 宣告變數
const usersPerPage = 15
const users = [];
let filteredUsers = []

// 串接 users API網址
function renderUsers() {
  axios
    .get(INDEX_URL)
    .then((response) => {
      users.push(...response.data.results);
      showUserList(getUsersByPage(1))
      showPaginator(users.length)
    })
    .catch((error) => console.log(error));
}

// 將 users 的 card 渲染到網頁上
function showUserList(users) {
  let userHTML = '';
  users.forEach((user) => {
    const userName = `${user.name} ${user.surname}`;
    userHTML += `
      <div class="card m-3 col-sm-2 rounded-3">
        <img src="${user.avatar}" class="card-img-top" alt="user photo" data-user-id="${user.id}">
        <div class="card-body d-flex flex-column" data-user-id="${user.id}">
          <h4 class="card-title" data-user-id="${user.id}">${userName}</h4>
        </div>
        <div class="card-footer d-flex justify-content-end">
          <button type="button" class="btn btn btn-info btn-show-user me-1" data-bs-toggle="modal" data-bs-target="#user-modal" data-user-id="${user.id}">More</button>
          <button type="button" class="btn btn-success btn-add-favorite" data-user-id="${user.id}">⭐</button>
        </div>
      </div>
      `;
  });
  userContainer.innerHTML = userHTML;
}

// 將 user 的資料放到 modal 內
function showUserModal(id) {
  // 若在缺少或無效的 id 情形下，跳出函式，避免網頁產生錯誤行為
  if (!id) {
    return;
  }
  const userTitle = document.querySelector('.modal-title');
  const userImage = document.querySelector('.user-modal-image');
  const userList = document.querySelector('#user-modal-info');

  //清空節點內容，避免出現在連續點擊時出現殘影
  userTitle.textContent = '';
  userImage.src = '';
  userList.innerHTML = '';

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;
      userTitle.textContent = `${data.name} ${data.surname}`;
      userImage.src = `${data.avatar}`;
      userList.innerHTML = `
        <li>gender: ${data.gender}</li>
        <li>age: ${data.age}</li>
        <li>region: ${data.region}</li>
        <li>birthday: ${data.birthday}</li>
        <li>email: ${data.email}</li>
      `;
    })
    .catch((error) => console.log(error));
}

// 將 user 加入收藏清單
function addToFavorite(id) {
  const user = users.find((user) => user.id === id)
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []

  if (list.some((user) => user.id === id)) {
    return alert('該名成員已加入我的最愛!')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

// 取得每頁所需數目的 user cards
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * usersPerPage
  return data.slice(startIndex, startIndex + usersPerPage)
}

// 顯示所有分頁
function showPaginator(amount) {
  const numberOfPage = Math.ceil(amount / usersPerPage)
  let pageHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    pageHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
    paginator.innerHTML = pageHTML
  }
}

// 將點擊事件放到 userContainer 監聽器內
userContainer.addEventListener('click', function containerClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(Number(event.target.dataset.userId))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.userId))
  }
})

// 在搜尋欄裝設監聽器
searchForm.addEventListener('submit', function searchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // 更正：宣告新變數 (searchResult) 可以暫存搜尋後的結果，當輸入亂碼找不到成員時， 
  // 即使點擊分頁器，原先搜尋的結果也不會被蓋掉
  const searchResult = users.filter(
    (user) => `${user.name} ${user.surname}`.toLowerCase().includes(keyword)
  );

  // 若沒有找到符合keyword的member，就回傳alert
  if (searchResult.length === 0) {
    return alert('找不到成員!');
  }

  filteredUsers = searchResult; //將搜尋結果賦值給 filteredUsers
  showPaginator(filteredUsers.length);
  showUserList(getUsersByPage(1));
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果點擊的元素不是<a>就跳出函式
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)

  // 移除前一個具有 active class 之分頁元素的 active class
  const activeElement = paginator.querySelector('.active');
  if (activeElement) {
    activeElement.classList.remove('active');
  }
  // 幫助使用者辨識當下閱讀的分頁
  event.target.classList.add('active')
  showUserList(getUsersByPage(page))

})

renderUsers();

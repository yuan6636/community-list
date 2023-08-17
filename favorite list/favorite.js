// 串接 API 的網址
const BASE_URL = 'https://user-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/users/';

// 尋找節點
const userContainer = document.querySelector('.user-container');
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 宣告變數
const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []

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
          <button type="button" class="btn btn btn-info btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-user-id="${user.id}">More</button>
          <button type="button" class="btn btn-danger btn-remove-favorite" data-user-id="${user.id}">X</button>
        </div>
      </div>
      `;
  });
  userContainer.innerHTML = userHTML;
}

// 將 user 的資料放到 modal 內
function showUserModal(id) {
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

// 從我的最愛移除
function removeFavorite(id) {
  const userIndex = users.findIndex((user) => user.id === id)

  users.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  showUserList(users)
}

// 將點擊事件放到 userContainer 監聽器內
userContainer.addEventListener('click', function containerClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(Number(event.target.dataset.userId))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.userId))
  }
})

showUserList(users)

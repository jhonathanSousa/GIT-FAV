import GithubUser from "./GithubUser.js";

export class Favorites{
  constructor(root){
    this.root = document.querySelector(root);
    this.tbody = this.root.querySelector('table tbody');
    this.load();
  }

  load(){
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
  }

  save(){
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  async add(username){
    try{

      const userExists = this.entries.find(entry => entry.login === username);

      if(userExists){
        throw new Error('User already registered');
      }


      const user = await GithubUser.search(username); 
      if(user.login === undefined){
        throw new Error('User not found! Try again');
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();

    }catch(error){
      alert(error.message);
    }
  }

  delete(user){
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login);
    this.entries = filteredEntries;
    this.update();
    this.save();
    this.addBgTable();
  }
}

export class FavoritesView extends Favorites{
  constructor(root){
    super(root);
    this.update();
    this.onadd();
  }

  onadd(){
    const addButton = this.root.querySelector('.search button');
    addButton.addEventListener('click', () => {
      const {value} = this.root.querySelector('.search input');
      this.add(value);
    });
  }

  update(){
    this.removeAllTr(); 
    
    this.entries.forEach(user => {
      const row = this.createRow();
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user a').href = `https://github.com/${user.login}`;
      row.querySelector('.user a p').textContent = user.name;
      row.querySelector('.user a span').textContent = `/ ${user.login}`;
      row.querySelector('.repositories').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Are you sure you want to delete?');

        if(isOk){
          this.delete(user);
        }
      }

      this.tbody.append(row)
      this.removeBgTable();
    });
  }

  createRow(){
    const tr = document.createElement('tr');
    tr.innerHTML =
    `
      <td class="user">
        <img src="" alt="Image">
        <a href="" target="_blank">
          <p></p>
          <span>/</span>
        </a>
      </td>

      <td class="repositories"></td>
      <td class="followers"></td>
      <td><button class="remove">Remover</button></td>
    `;
    return tr;
  }

  removeAllTr(){
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove();
    });
  }

  addBgTable(){
    const bgTable = this.root.querySelector('#bg-table');
    bgTable.classList.remove('active');
  }

  removeBgTable(){
    const bgTable = this.root.querySelector('#bg-table');
    bgTable.classList.add('active');
  }
}
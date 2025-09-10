const cl = console.log;
const personsForm = document.getElementById('personsForm');
const nameControl = document.getElementById('name');
const infoControl = document.getElementById('info');
const categoryControl = document.getElementById('category');
const cardsContainer = document.getElementById('cardsContainer');
const loader = document.getElementById('loader');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');

const base_url = `https://crudbyaniket-default-rtdb.asia-southeast1.firebasedatabase.app`;
const allData_url = `${base_url}/persons.json`;

const showLoader = () => {
    loader.classList.remove('d-none')
};

const hideLoader = () => {
    loader.classList.add('d-none')
};

const snackBar = (msg, icon) => {
    swal.fire({
        title: msg,
        icon: icon,
        timer: 2500
    })
};

const templating = (arr) => {
    let result = ``
    arr.forEach(obj => {
        result += `
            <div class="col-lg-4 col-md-6 mb-3" id="${obj.id}">
                <div class="card color-light">
                    <div class="card-header color-dark">
                        <h4 class="m-0 text-truncate">${obj.name}</h4>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${obj.info}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center color-dark">
                        <div class="button-group">
                            <button onclick="onEdit(this)" class="btn btn-primary mr-2">Edit</button>
                            <button onclick="onDelete(this)" class="btn btn-danger">Delete</button>
                        </div>
                        <span>${obj.category}</span>
                    </div>
                </div>
            </div>`
    })
    cardsContainer.innerHTML = result
};

const getAllData = () => {
    showLoader()
    let xhr = new XMLHttpRequest()
    xhr.open('GET', allData_url)
    xhr.setRequestHeader('Authorization', 'Token')
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.send(null)
    xhr.onload = () => {
        hideLoader()
        if(xhr.status >= 200 && xhr.status <= 299){
            let res = JSON.parse(xhr.response)
            let resArray = Object.entries(res).map(arr => ({
                id: arr[0],
                ...arr[1]
            }))
            templating(resArray.reverse())
        }else{
            let msg = `${xhr.status}: Something went wrong while getting data`
            snackBar(msg, 'error')
        }
    }
    xhr.onerror = () => {
        let err = `Network error occurred during XHR request`
        hideLoader()
        snackBar(err, 'error')
    }
};

getAllData();

const createNewCard = (obj) => {
    newCol = document.createElement('div')
    newCol.className = `col-lg-4 col-md-6 mb-3"`
    newCol.id = obj.id
    newCol.innerHTML = `
                <div class="card color-light">
                    <div class="card-header color-dark">
                        <h4 class="m-0 text-truncate">${obj.name}</h4>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${obj.info}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center color-dark">
                        <div class="button-group">
                            <button onclick="onEdit(this)" class="btn btn-primary mr-2">Edit</button>
                            <button onclick="onDelete(this)" class="btn btn-danger">Delete</button>
                        </div>
                        <span>${obj.category}</span>
                    </div>
                </div>`
    cardsContainer.prepend(newCol)
    snackBar(`New ${obj.name} card created successfully`, 'success')            
};

const patchData = (obj) => {
    nameControl.value = obj.name
    infoControl.value = obj.info
    categoryControl.value = obj.category
    addBtn.classList.add('d-none')
    updateBtn.classList.remove('d-none')
};

const updateCard = (obj) => {
    let updatedCol = document.getElementById(obj.id)
    updatedCol.querySelector('h4').innerHTML = obj.name
    updatedCol.querySelector('p').innerHTML = obj.info
    updatedCol.querySelector('span').innerHTML = obj.category
    addBtn.classList.remove('d-none')
    updateBtn.classList.add('d-none')
    snackBar(`${obj.name} card updated successfully`, 'success')
};

const onPersonAdd = (eve) => {
    eve.preventDefault()
    let newPersonObj = {
        name: nameControl.value,
        info: infoControl.value,
        category: categoryControl.value
    }
    personsForm.reset()
    showLoader()
    let xhr = new XMLHttpRequest()
    xhr.open('POST', allData_url)
    xhr.setRequestHeader('Authorization', 'Token')
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.send(JSON.stringify(newPersonObj))
    xhr.onload = () => {
        hideLoader()
        if(xhr.status >= 200 && xhr.status <= 299){
            let resId = JSON.parse(xhr.response).name
            createNewCard({...newPersonObj, id: resId})
        }else{
            let msg = `${xhr.status}: Something went wrong while creating person's card`
            snackBar(msg, 'error')
        }
    }
    xhr.onerror = () => {
        let err = `Network error occurred during XHR request`
        hideLoader()
        snackBar(err, 'error')
    }
};

const onEdit = (ele) => {
    let editId = ele.closest('.col-lg-4').id
    localStorage.setItem('editId', editId)
    let edit_url = `${base_url}/persons/${editId}.json`
    showLoader()
    let xhr = new XMLHttpRequest()
    xhr.open('GET', edit_url)
    xhr.setRequestHeader('Authorization', 'Token')
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.send(null)
    xhr.onload = () => {
        hideLoader()
        if(xhr.status >= 200 && xhr.status <= 299){
            let resEditObj = JSON.parse(xhr.response)
            patchData(resEditObj)
        }else{
            let msg = `${xhr.status}: Something went wrong while editing person's card`
            snackBar(msg, 'error')
        }
    }
    xhr.onerror = () => {
        let err = `Network error occurred during XHR request`
        hideLoader()
        snackBar(err, 'error')
    }
};

const onPersonUpdate = () => {
    if(nameControl.value && infoControl.value){
        let updateId = localStorage.getItem('editId')
        localStorage.removeItem('editId')
        let update_url = `${base_url}/persons/${updateId}.json`
        let updatedObj = {
            name: nameControl.value,
            info: infoControl.value,
            category: categoryControl.value
        }
        personsForm.reset()
        showLoader()
        let xhr = new XMLHttpRequest()
        xhr.open('PATCH', update_url)
        xhr.setRequestHeader('Authorization', 'Token')
        xhr.setRequestHeader('Content-type', 'application/json')
        xhr.send(JSON.stringify(updatedObj))
        xhr.onload = () => {
            hideLoader()
            if(xhr.status >= 200 && xhr.status <= 299){
                let resUpdatedObj = JSON.parse(xhr.response)
                updateCard({...resUpdatedObj, id:updateId})
            }else{
                let msg = `${xhr.status}: Something went wrong while updating person's card`
                snackBar(msg, 'error')
            }
        }
        xhr.onerror = () => {
            let err = `Network error occurred during XHR request`
            hideLoader()
            snackBar(err, 'error')
        }
    }else{
        hideLoader()
        snackBar(`Field cannot be empty while updating`, 'warning')
    }
};

const onDelete = (ele) => {
    swal.fire({
        title: "Are you sure to delete this card?",
        text: "Card will be deleted permanently",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Delete"
      }).then((result) => {
        if (result.isConfirmed){
            let deleteId = ele.closest('.col-lg-4').id
            let delete_url = `${base_url}/persons/${deleteId}.json`
            showLoader()
            let xhr = new XMLHttpRequest()
            xhr.open('DELETE', delete_url)
            xhr.setRequestHeader('Authorization', 'Token')
            xhr.setRequestHeader('Content-type', 'application/json')
            xhr.send(null)
            xhr.onload = () => {
                hideLoader()
                if(xhr.status >= 200 && xhr.status <= 299){
                    ele.closest('.col-lg-4').remove()
                    snackBar(`Card deleted successfully`, 'success')
                }else{
                    let msg = `${xhr.status}: Something went wrong while creating person's card`
                    snackBar(msg, 'error')
                }
            }
            xhr.onerror = () => {
                let err = `Network error occurred during XHR request`
                hideLoader()
                snackBar(err, 'error')
            }
        }
      });
};

personsForm.addEventListener('submit', onPersonAdd);
updateBtn.addEventListener('click', onPersonUpdate);
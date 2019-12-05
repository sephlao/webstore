// set global defaults
const SETTINGS = {
    sort: 'plh', // price low to high
    category: 'all', // show all products
    imagePath: 'img/products/'
};

// start with empty cart
const CART = {
    items: [],
    add: function (item) { this.items.push(item) },
    remove: function (index) { this.items.splice(index, 1) },
}

/**
 * get products data using async await
 */
const getProductsData = async () => await fetch(`data/products.json`).then(d => d.json()).catch(e => console.error(e));

/**
 * returns product as html template
 * @param {{}} product 
 */
const getProductTemplate = product => {
    const getRatingsHTML = rating => { // takes rating number and converts it to material icon
        let halfStar = rating % 1;
        let starIcon = '';
        for (let i = 0; i < 5; i++) {
            if (i < parseInt(rating))
                starIcon += `<span class="material-icons">star</span>`
            else {
                starIcon += halfStar ?
                    `<span class="material-icons">star_half</span>` :
                    `<span class="material-icons">star_border</span>`;
                halfStar = 0;
            }
        }
        return starIcon;
    };
    return `
    <section class="card product">
        <div class="card-header">
            <div class="product-name">
            <h2>${product.name}</h2>
            <h3>${product.category}</h3>
            </div>
            <h1 class="price">$${product.price.toFixed(2)}</h1>
        </div>
        <div class="card-body">
            <img src="${SETTINGS.imagePath + product.imgSrc}" class="product-img" alt="${product.name}">
            <div class="extra_info">
            <div class="form-group">
                <p>Case Size:</p>
                <input type="radio" name="${product.id}_caseSize" value="40" id="${product.id}_40" checked>
                <label for="${product.id}_40">40</label>
                <input type="radio" name="${product.id}_caseSize" value="43" id="${product.id}_43">
                <label for="${product.id}_43">43</label>
            </div>
            <div class="rating">${getRatingsHTML(product.rating)}</div>
            <p class="reviews">${product.reviews} reviews</p>
            <button type="button" class="btn add" data-productid="${product.id}">add to cart</button>
            </div>
        </div>
    </section>`
};

/**
 * renders products on html page
 * @param {{}} products 
 */
const renderProductsOnHTML = products =>
    document.getElementById(`products`).innerHTML =
    `<p>Showing ${products.length} products...</p>` + products.reduce((acc, p) => acc + getProductTemplate(p), ``);

/**
 * returns sorted products
 * @param {string} sortby 
 * @param {{}} products 
 */
const getSortedProducts = (sortby, products) => (sortby.startsWith('p')) ?
    products.sort((a, b) => sortby == 'plh' ? a.price - b.price : b.price - a.price) :
    products.sort((a, b) => sortby == 'rlh' ? a.rating - b.rating : b.rating - a.rating);

/**
 * returns searched products
 * @param {string} search 
 * @param {{}} products 
 */
const getSearchedProducts = (search, products) => products.filter(p => p.name.toLowerCase().includes(search));

/**
 * returns products by specific category
 * @param {string} category 
 * @param {{}} products 
 */
const getProductsByCategory = (category, products) => products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));

/**
 * event callback that filters products based on search, sort and category value
 * @param {{}} products 
 */
const doFiltering = products => {
    const category = document.getElementById(`category`).value;
    const sort = document.getElementById(`sort`).value;
    const search = document.getElementById(`search`).value.trim();
    // filter products by category then sort accordingly if search value is > 2 then search product
    const filteredProducts = getSearchedProducts(search.length > 2 ? search : '', getSortedProducts(sort, !category ? products : getProductsByCategory(category, products)));
    renderProductsOnHTML(filteredProducts)
};

/**
 * add selected product to cart
 * @param {string} productId 
 */
const addProductToCart = productId => {
    const caseSize = +document.querySelector(`input[name="${productId}_caseSize"]:checked`).value;

    // find product on cart if it exist increment qty else add item to cart
    const cartItem = CART.items.find(item => item.id == productId && item.size == caseSize);
    if (cartItem) cartItem.quantity++;
    else CART.add({ id: productId, size: caseSize, quantity: 1 });

    document.getElementById(`cart_count`).innerText = CART.items.length;
};

/**
 * toggles cart section show/hide
 */
const toggleShoppingCart = () => {
    document.querySelector(`aside.cart.wrapper`).classList.toggle(`show`);
}

/**
 * window on load event listener
 */
window.addEventListener(`load`, async () => {
    // get products
    const products = await getProductsData();
    // sort products by default settings
    // render products on html
    renderProductsOnHTML(getSortedProducts(SETTINGS.sort, [...products]));

    const listenToFilterEvents = () => doFiltering([...products]);
    // add search event listener
    document.getElementById(`search`).addEventListener(`input`, listenToFilterEvents);
    // add filter event listener for sort and category
    document.querySelectorAll(`select`).forEach(s => s.addEventListener(`change`, listenToFilterEvents));

    // body click event deligation
    document.body.addEventListener(`click`, ({ target }) => {
        const match = str => target.matches(str);
        if (match(`button[data-productid]`)) addProductToCart(target.dataset.productid);
        else if(match(`.cart.wrapper`) || match(`button.btn.shopping_cart`) || match(`button.btn.shopping_cart > .material-icons`)) toggleShoppingCart();
        else return;
    });

});

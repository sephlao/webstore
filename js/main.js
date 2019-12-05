// set global defaults
const SETTINGS = {
    sort: 'plh', // price low to high
    category: 'all',
    imagePath: 'img/products/'
};

/**
 * get products data using async await
 */
const getProductsData = async () => await fetch(`data/products.json`).then(d => d.json()).catch(e => console.error(e));

const getProductTemplate = product => {
    const getRatingsHTML = rating => {
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

const renderProductsOnHTML = products => {
    const productsElement = document.getElementById(`products`);
    productsElement.innerHTML = products.reduce((acc, p) => acc + getProductTemplate(p), ``);
    productsElement.insertAdjacentHTML(`afterbegin`, `<p>Showing ${products.length} products...</p>`)

};

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
    const category = document.getElementById(`category`).value
    const sort = document.getElementById(`sort`).value
    const search = document.getElementById(`search`).value
    // filter products by category then sort accordingly if search value is > 2 then search product
    const filteredProducts = getSearchedProducts(search.length > 2 ? search : '', getSortedProducts(sort, !category ? products : getProductsByCategory(category, products)));
    renderProductsOnHTML(filteredProducts)
};

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
    document.querySelectorAll(`select`).forEach(s => s.addEventListener(`change`, listenToFilterEvents))
});

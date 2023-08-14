import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Modal, notification } from 'antd';
import EditProduct from './EditProduct';

function Main({ user }) {
    const [getProducts, setGetProducts] = useState([]);
    const [getProductId, setGetProductId] = useState();
    const [search, setSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(2);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = getProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const pageNumbers = [];
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    for (let i = 1; i <= Math.ceil(getProducts.length / productsPerPage); i++) {
        pageNumbers.push(i);
    }

    const fetchData = async () => {
        axios.get('https://enisreact.innovaticacode.com/laravel/public/api/users/' + user?.id).then((res) => {
            setGetProducts(res.data.data.products);
        });
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleDelete = () => {
        axios
            .delete('https://enisreact.innovaticacode.com/laravel/public/api/products/' + getProductId)
            .then((res) => {
                console.log(res);
                if (res.data.status == 204) {
                    notification.success({
                        message: 'Success!',
                        description: res.data.message,
                        duration: 500,
                    });
                    setGetProductId(null);
                    setIsDeleteModalVisible(false);
                    fetchData();
                }
            });
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    useEffect(() => {
        const filteredProducts = getProducts.filter((product) =>
            product.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredProducts(filteredProducts);
        setCurrentPage(1); // Her arama sonrası sayfayı sıfırla
    }, [search, getProducts]);

    const productsToDisplay =
        search !== '' ? filteredProducts : currentProducts;

    const [selectedProduct, setSelectedProduct] = useState(null);

    return (
        <>
            {selectedProduct ? (
                <EditProduct
                    product={selectedProduct}
                    user={user}
                    onCancel={() => setSelectedProduct(null)}
                />
            ) : (
                <>
                    <div className="ps-page__dashboard">
                        <div className="table-responsive">
                            <table className="table ps-table--whishlist ps-table--responsive">
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Product name</th>
                                        <th>Category</th>
                                        <th>Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productsToDisplay.length > 0
                                        ? productsToDisplay.map(
                                              (product, index) => (
                                                  <tr key={product.id}>
                                                      <td data-label="No">
                                                          {indexOfFirstProduct +
                                                              index +
                                                              1}
                                                      </td>
                                                      <td data-label="Product Name">
                                                          {product.name}
                                                      </td>
                                                      <td data-label="Category">
                                                          {product.title}
                                                      </td>

                                                      <td data-label="Management">
                                                          <div className="d-flex align-items-center">
                                                              <Button
                                                                  className="mr-3"
                                                                  type="button"
                                                                  onClick={() => {
                                                                      setSelectedProduct(
                                                                          product
                                                                      );
                                                                  }}>
                                                                  <i className="fa fa-edit"></i>
                                                              </Button>
                                                              <Button
                                                                  type="button"
                                                                  onClick={(
                                                                      event
                                                                  ) => {
                                                                      event.preventDefault();
                                                                      setGetProductId(
                                                                          product.id
                                                                      );
                                                                      setIsDeleteModalVisible(
                                                                          true
                                                                      );
                                                                  }}>
                                                                  <i className="icon-cross"></i>
                                                              </Button>
                                                          </div>
                                                      </td>
                                                  </tr>
                                              )
                                          )
                                        : 'Nothing else'}
                                </tbody>
                            </table>
                            <div className="ps-pagination">
                                <ul className="pagination">
                                    {pageNumbers.map((number) => (
                                        <li
                                            key={number}
                                            className={
                                                number == currentPage &&
                                                'active'
                                            }>
                                            <a
                                                onClick={() => paginate(number)}
                                                href="#">
                                                {number}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Confirmation"
                visible={isDeleteModalVisible}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalVisible(false)}>
                <p>Are you sure you want to delete this product?</p>
            </Modal>
        </>
    );
}

export default Main;

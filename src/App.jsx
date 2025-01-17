import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import axios from 'axios';
import apiPath from '../apiPath';  //API路徑檔案

//環境變數(.env)
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;


function App() {
  //登入資料物件
  const [userData, setUserData] = useState({
    username:'',
    password:''
  });

  //驗證是否登入
  const [isLogIn, setIsLogIn] = useState(false);

  //登入畫面帳號密碼處理
  const handle = (e) => {
    const {name, value} = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  //產品狀態
  const [product, setProduct] = useState({});

  //產品是否有撈回來
  const [productList, setProductList] = useState([]);

  //登入處理
  const handleLogIn = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}${apiPath.signInPath}`, userData)
      .then(res => {
        setIsLogIn(true);
        const {token, expired} = res.data;

        //token存進cookie
        document.cookie = `Token=${token}; expires=${new Date(expired)}`;

        //請求自動帶入token
        axios.defaults.headers.common['Authorization'] = token;

        axios.get(`${BASE_URL}v2/api/${API_PATH}/admin/products`)
          .then(res => setProductList(res.data.products))
          .catch(err => console.error())
      })
      .catch(err =>{
        alert("帳號或密碼錯誤");
        console.log(err);
      })
  };

  //登出處理
  const handleLogOut = () => {
    setIsLogIn(false);
  };

  //登入頁面帳號密碼清除
  const handleClear = () => {
    setUserData({
      username:'',
      password:''
    });
  };

  //驗證是否登入
  const checkLogIn = () => {
    const checkLog = document.getElementById('checkLog');
    axios.post(`${BASE_URL}${apiPath.signInCheck}`)
      .then(res => {isLogIn ? checkLog.textContent = '驗證是否有登入(已登入)' : '未登入'})
      .catch(err => console.error())
  };

  return (
    <>
      {isLogIn ? 
        <div className="container mt-3">
					<div className="row">
						<div className="col-6">
							<h2 className="text-center mb-5">產品列表</h2>
              <div className="d-flex justify-content-center gap-3">
                <button id="checkLog" type="button" className="btn btn-success" onClick={checkLogIn}>驗證是否有登入</button>
                <button type="button" className="btn btn-danger" onClick={handleLogOut}>登出</button>
              </div>
							<table className="table">
								<thead>
									<tr className="fs-4 text-primary">
										<th scope="col">產品名稱</th>
										<th scope="col">原價</th>
										<th scope="col">售價</th>
										<th scope="col">是否啟用</th>
										<th scope="col">查看細節</th>
									</tr>
								</thead>
								<tbody>
									{productList.map((product) => (
										<tr className="fs-5" key={product.id}>
											<th scope="row">{product.title}</th>
											<td>{product.origin_price}</td>
											<td>{product.price}</td>
											<td>{product.is_enabled ? '啟用' : '未啟用'}</td>
											<td><button type="button" className="btn btn-primary" onClick={() => {
												setProduct(product);
											}}>查看細節</button></td>
										</tr>
								))}
								</tbody>
							</table>
						</div>
						<div className="col-6">
						<h2 className="text-center mb-5">單一產品細節</h2>
						{/*判斷product是否為undefined*/}
            {product.content ? <div className="card">
							<img src={product.imageUrl} className="card-img-top object-fit-cover" style={{maxHeight:'500px'}} alt={product.title} />
							<div className="card-body">
								<h5 className="card-title">{product.title} <span className="badge text-bg-primary">{product.category}</span></h5>
								<p className="card-text">商品描述：{product.description}</p>
								<p className="card-text">商品內容：{product.content}</p>
								<p className="card-text"><del>{product.origin_price}</del> / {product.price} 元</p>
								<h5 className="card-title">更多圖片:</h5>
								<div className="d-flex flex-wrap">
									{product.imagesUrl && product.imagesUrl.map((image, index) => {
									return <img className="img-fluid w-50 object-fit-cover" src={image} key={index} />
								})}
								</div>
							</div>
						</div>: <p className="text-secondary text-center">請選一個商品查看</p>}
          </div>
				</div>
			</div> : 
      <div>
        <h1 className='text-center'>請先登入</h1>
        <form id="logInForm" style={{border: '3px solid gray', margin: '10px 20px', padding: '10px 0'}}>
          <div className="text-center mt-3">
            <label htmlFor="account" className="me-3 fs-5 w-100">帳號</label>
            <input id="account" name="username" value={userData.username} onChange={handle} />
          </div>
          <div className="text-center mt-3">
            <label htmlFor="password" className="me-3 fs-5 w-100">密碼</label>
            <input type="password" id="password" name="password" value={userData.password} onChange={handle} />
          </div>
          <div className="d-flex justify-content-center gap-3">
            <button className="mt-3 px-3 btn btn-primary" onClick={handleLogIn}>送出</button>
            <button type="button" className="mt-3 px-3 btn btn-secondary" onClick={handleClear}>清除</button>
          </div>
        </form>
      </div>}
    </>
  )
}

export default App

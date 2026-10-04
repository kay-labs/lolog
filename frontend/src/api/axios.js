import axios from 'axios'

/* 기본적으로 js는 다음과 같은 내장함수를 제공.
*
* fetch('/api/posts/1',{
*   method: 'GET',
*   readers: {
*     'Autorization':'Beaver ' + token.
*     'Content-Type':'application/json'
*   }
* })
* .then(res => res.json())
* .then(data => console.log(data))
* .catch(err => console.error(err))
*
* 그런데 이 fetch를 감싼 라이브러리, 무료 오픈소스가 axios이고 아래처럼 사용할 수 있게 해줌
* axios.get('api/post/1').then(data => console.lgo(data))
*
* */

const api = axios.create({
  baseURL: '/api', // ex.${AAA}/auth.. 기존에는 이렇게 썼는데 ${AAA}를 미리 정의해두어서 모든 요청에 /api가 자동으로 붙음
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { // 모든 응답에서 401이 뜨면 로그인 페이지로 이동
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

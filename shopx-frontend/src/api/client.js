import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const api = {
  get:      (url, params)   => client.get(url, { params }),
  post:     (url, data)     => client.post(url, data),
  put:      (url, data)     => client.put(url, data),
  patch:    (url, params)   => client.patch(url, null, { params }),
  patchUrl: (url, params)   => client.patch(url, null, { params }),
  delete:   (url)           => client.delete(url),
}

export default client

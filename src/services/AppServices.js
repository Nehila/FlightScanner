import axios from 'axios';
 

const END_POINTAPI = `https://f78c-62-171-169-242.ngrok-free.app/api`

const instance = axios.create({
  baseURL: END_POINTAPI,
  timeout: 50000, 
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'mode': "no-cors",
  },
});

instance.interceptors.request.use(function (config) {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : null
    },
  };
});

const responseBody = (response) => response.data;


export const AppServices = {
  get: (body, url) => instance.get(END_POINTAPI + url, body).then(responseBody),

  post: (body, url) => instance.post(END_POINTAPI + url, body).then(responseBody),

  upload: (body, data_type, url, header) => instance.post(END_POINTAPI + url, body, {
    headers: {
      ...header,
      'Data-Type': data_type,
    },
  }).then(responseBody),

  put: (body, url) => instance.put(END_POINTAPI + url, body).then(responseBody),

  patch: (body, url) => instance.patch(END_POINTAPI + url, body).then(responseBody),

  delete: (body, url) => instance.delete(END_POINTAPI + url, body).then(responseBody),
};

export const GlobalManagement = {
  set: (key, val) => localStorage.setItem(key, val) 
}

export default AppServices;

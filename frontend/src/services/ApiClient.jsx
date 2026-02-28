import axios from 'axios';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');

const decodedData = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')) : null

export {
    apiClient,
    getAuthHeaders,
    socket,
    decodedData
}
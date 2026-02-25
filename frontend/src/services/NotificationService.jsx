import { apiClient, getAuthHeaders } from "./ApiClient";

const countNotifications = async(readStatus = 0) => {
    const token = localStorage.getItem('token')
    if (!token) return 0

    const response = await apiClient.get(
        `/notifications/count?read=${readStatus}`,
        getAuthHeaders(token)
    )

    return response.data
}

const getNotificationsByUser = async(page = 1, readStatus = 0) => {
    const token = localStorage.getItem('token')
    if (!token) return 0

    const response = await apiClient.get(
        `/notifications?page=${page}&read=${readStatus}`,
        getAuthHeaders(token)
    )

    return response.data
}

export {
    countNotifications,
    getNotificationsByUser
}
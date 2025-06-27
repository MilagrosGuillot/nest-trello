const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

// Función helper para obtener el token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Función helper para hacer peticiones autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Boards API
export const boardsApi = {
  getAll: () => authenticatedFetch('/boards'),
  getById: (id: string) => authenticatedFetch(`/boards/${id}`),
  create: (data: { title: string }) => authenticatedFetch('/boards', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: { title: string }) => authenticatedFetch(`/boards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => authenticatedFetch(`/boards/${id}`, {
    method: 'DELETE',
  }),
  // Nuevas funciones para miembros
  addMember: (boardId: string, userId: string) => authenticatedFetch(`/boards/${boardId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  removeMember: (boardId: string, memberId: string) => authenticatedFetch(`/boards/${boardId}/members/${memberId}`, {
    method: 'DELETE',
  }),
};

// Users API (para buscar usuarios)
export const usersApi = {
  searchByEmail: (email: string) => authenticatedFetch(`/users/search?email=${email}`),
  getAll: () => authenticatedFetch('/users'),
};

// Lists API
export const listsApi = {
  getByBoard: (boardId: string) => authenticatedFetch(`/lists/board/${boardId}`),
  create: (data: { title: string; order: number; boardId: string }) => authenticatedFetch('/lists', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: { title: string; order: number; boardId: string }) => authenticatedFetch(`/lists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => authenticatedFetch(`/lists/${id}`, {
    method: 'DELETE',
  }),
};

// Cards API
export const cardsApi = {
  getByBoard: (boardId: string) => authenticatedFetch(`/cards/board/${boardId}`),
  create: (data: { title: string; description?: string; order: number; listId: string }) => authenticatedFetch('/cards', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: { title?: string; description?: string; order?: number; listId?: string; completed?: boolean }) => authenticatedFetch(`/cards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => authenticatedFetch(`/cards/${id}`, {
    method: 'DELETE',
  }),
}; 
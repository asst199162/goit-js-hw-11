import axios from 'axios';

export default class ImageApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchQuery() {
    const BASE_URL = 'https://pixabay.com/api/';
    const KEY = '28254467-e55a3c51fbddb13150c9a3a3e';

    const url = `${BASE_URL}?key=${KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`;

    try {
      const response = await axios.get(url);
      this.page += 1;
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}

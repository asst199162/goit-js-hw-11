import { Notify } from 'notiflix/build/notiflix-notify-aio';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import ImageApiService from './imageApiService.js';
import './sass/main.scss';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  endSearchInfo: document.querySelector('.end-search__info'),
  loading: document.querySelector('.loading'),
};
const { form, gallery, endSearchInfo, loading, overlay } = refs;

const imageApiService = new ImageApiService();

form.addEventListener('submit', onSearch);

let shownImages = 0;
let lightbox = {};

async function onSearch(event) {
  event.preventDefault();

  resetGallery();
  imageApiService.resetPage();
  window.removeEventListener('scroll', scrollAndLoading);
  hideEndSearchMessage();
  hideLoading();

  imageApiService.query = form.elements.searchQuery.value.trim();

  try {
    const data = await imageApiService.fetchQuery();

    if (data.totalHits === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        {
          position: 'left-top',
        },
      );
    }

    shownImages = data.hits.length;

    Notify.success(`Hooray! We found ${data.totalHits} images.`, {
      position: 'left-top',
    });

    appendCardsMurkup(data.hits);
    addLightbox();

    // Add scroll listener
    window.addEventListener('scroll', scrollAndLoading);

    if (shownImages === data.totalHits) {
      hideLoading();
    }
  } catch (error) {
    console.log(error);
  }
}

function scrollAndLoading() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (clientHeight + scrollTop >= scrollHeight) {

    showLoading();


    setTimeout(loadMore, 500);
  }

  if (endSearchInfo.classList.contains('show')) {
    hideLoading();
  }
}

function showLoading() {
  loading.classList.add('show');
}

function hideLoading() {
  loading.classList.remove('show');
}

async function loadMore() {
  try {
    const data = await imageApiService.fetchQuery();
    appendCardsMurkup(data.hits);
    smoothRendering();

    lightbox.refresh();

    shownImages += data.hits.length;
    if (shownImages >= data.totalHits) {
      showEndSearchMessage();
    }
  } catch (error) {
    console.log(error);
  }
}

function generateCardsMurkup(cardsArray) {
  return cardsArray
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
      return `<a href="${largeImageURL}" class="photo-card">
        <img src="${webformatURL}" alt="${tags}" class="photo-card__img" width="300" loading="lazy" />
        <div class="info">
          <p class="info-item"><b>Likes</b><br />${likes}</p>
          <p class="info-item"><b>Views</b><br />${views}</p>
          <p class="info-item"><b>Comments</b><br />${comments}</p>
          <p class="info-item"><b>Downloads</b><br />${downloads}</p>
        </div>
      </a>`;
    })
    .join('');
}

function appendCardsMurkup(cards) {
  gallery.insertAdjacentHTML('beforeend', generateCardsMurkup(cards));
  hideLoading();
}

function resetGallery() {
  gallery.innerHTML = '';
}

function addLightbox() {
  lightbox = new SimpleLightbox('.gallery a', {
    showCounter: false,
    captionsData: 'alt',
    captionDelay: 250,
  });
}


function smoothRendering() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function showEndSearchMessage() {
  endSearchInfo.classList.add('show');
}

function hideEndSearchMessage() {
  endSearchInfo.classList.remove('show');
}

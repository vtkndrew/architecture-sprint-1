import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { CurrentUserContext } from './contexts/CurrentUserContext'
import Card from './components/Card'
import AddPlacePopup from './components/AddPlacePopup'
import ImagePopup from './components/ImagePopup'
import api from './utils/api'

import './index.css'

const App = ({ eventBus }) => {
  const [currentUser, setCurrentUser] = useState({})

  useEffect(() => {
    const currentUserUpdated = value => {
      setCurrentUser(value)
    }
    const showAddPlacePopupCb = () => {
      setIsAddPlacePopupOpen(true)
    }
    const closeAllPopupsCb = () => {
      closeAllPopups()
    }

    eventBus.subscribe('currentUser', currentUserUpdated)
    eventBus.subscribe('showAddPlacePopup', showAddPlacePopupCb)
    eventBus.subscribe('closeAllPopups', closeAllPopupsCb)
    return () => {
      eventBus.unsubscribe('currentUser', currentUserUpdated)
      eventBus.unsubscribe('showAddPlacePopup', showAddPlacePopupCb)
      eventBus.unsubscribe('closeAllPopups', closeAllPopupsCb)
    }
  }, [eventBus])

  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cards, setCards] = useState([])

  useEffect(() => {
    api
      .getCardList()
      .then(cardData => {
        setCards(cardData)
      })
      .catch(err => console.log(err))
  }, [])

  function handleCardClick(card) {
    setSelectedCard(card)
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id)
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then(newCard => {
        setCards(cards => cards.map(c => (c._id === card._id ? newCard : c)))
      })
      .catch(err => console.log(err))
  }

  function handleCardDelete(card) {
    api
      .removeCard(card._id)
      .then(() => {
        setCards(cards => cards.filter(c => c._id !== card._id))
      })
      .catch(err => console.log(err))
  }

  function handleAddPlaceSubmit(newCard) {
    api
      .addCard(newCard)
      .then(newCardFull => {
        setCards([newCardFull, ...cards])
        eventBus.publish('closeAllPopups')
      })
      .catch(err => console.log(err))
  }

  function closeAllPopups() {
    setIsAddPlacePopupOpen(false)
    setSelectedCard(null)
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <section className="places page__section">
        <ul className="places__list">
          {cards.map(card => (
            <Card
              key={card._id}
              card={card}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
            />
          ))}
        </ul>
      </section>
      {createPortal(
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onAddPlace={handleAddPlaceSubmit}
          onClose={() => {
            eventBus.publish('closeAllPopups')
          }}
        />,
        document.body
      )}
      {createPortal(
        <ImagePopup
          card={selectedCard}
          onClose={() => {
            eventBus.publish('closeAllPopups')
          }}
        />,
        document.body
      )}
    </CurrentUserContext.Provider>
  )
}

export default App

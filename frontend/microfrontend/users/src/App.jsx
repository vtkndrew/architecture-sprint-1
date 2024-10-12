import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { CurrentUserContext } from './contexts/CurrentUserContext'
import EditProfilePopup from './components/EditProfilePopup'
import EditAvatarPopup from './components/EditAvatarPopup'
import api from './utils/api'

import './index.css'

const App = ({ eventBus }) => {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false)
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState({})
  const imageStyle = { backgroundImage: `url(${currentUser.avatar})` }

  useEffect(() => {
    const closeAllPopupsCb = () => {
      closeAllPopups()
    }

    eventBus.subscribe('closeAllPopups', closeAllPopupsCb)
    return () => {
      eventBus.unsubscribe('closeAllPopups', closeAllPopupsCb)
    }
  }, [eventBus])

  useEffect(() => {
    eventBus.publish('currentUser', currentUser)
  }, [eventBus, currentUser])

  useEffect(() => {
    api
      .getUserInfo()
      .then(userData => {
        setCurrentUser(userData)
      })
      .catch(err => console.log(err))
  }, [])

  function onAddPlace() {
    eventBus.publish('showAddPlacePopup')
  }

  function handleUpdateUser(userUpdate) {
    api
      .setUserInfo(userUpdate)
      .then(newUserData => {
        setCurrentUser(newUserData)
        eventBus.publish('closeAllPopups')
      })
      .catch(err => console.log(err))
  }

  function handleUpdateAvatar(avatarUpdate) {
    api
      .setUserAvatar(avatarUpdate)
      .then(newUserData => {
        setCurrentUser(newUserData)
        eventBus.publish('closeAllPopups')
      })
      .catch(err => console.log(err))
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true)
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true)
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false)
    setIsEditAvatarPopupOpen(false)
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <section className="profile page__section">
        <div
          className="profile__image"
          onClick={handleEditAvatarClick}
          style={imageStyle}
        />
        <div className="profile__info">
          <h1 className="profile__title">{currentUser.name}</h1>
          <button
            className="profile__edit-button"
            type="button"
            onClick={handleEditProfileClick}
          />
          <p className="profile__description">{currentUser.about}</p>
        </div>
        <button
          className="profile__add-button"
          type="button"
          onClick={onAddPlace}
        />
        {createPortal(
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onUpdateUser={handleUpdateUser}
            onClose={() => {
              eventBus.publish('closeAllPopups')
            }}
          />,
          document.body
        )}
        {createPortal(
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onUpdateAvatar={handleUpdateAvatar}
            onClose={() => {
              eventBus.publish('closeAllPopups')
            }}
          />,
          document.body
        )}
      </section>
    </CurrentUserContext.Provider>
  )
}

export default App

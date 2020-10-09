import React from 'react';
import { Route, Link } from 'react-router-dom'
import NotefulContext from './NotefulContext'
import FolderList from './FolderList/FolderList'
import NoteList from './NoteList/NoteList'
import FullNoteMain from './FullNoteMain/FullNoteMain'
import FullNoteSide from './FullNoteSide/FullNoteSide'
import NotefulError from './ErrorBoundary/ErrorBoundary'
import config from './config';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      folders: [],
      notes: []
    };
  }

  handleDeleteNote = (noteId) => {
    console.log(noteId)
    fetch(`${config.API_ENDPOINT}/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer 910237e9-95fd-4ecf-b17b-4af6605a1f01',
        'content-type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e));
        return res;
      })
      .then(() => {
        this.sendGetRequest()
      })
      .catch(
        error => this.setState({ error })
      )
  };

  handleCreateFolder = (name) => {
    fetch(`${config.API_ENDPOINT}folders/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: name
      })
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e));
        return res.json();
      })
      .then(() => this.sendGetRequest())
      .catch(
        error => this.setState({ error })
      );
  }

  handlePostRequest = (body, destination) => {
    fetch(`${config.API_ENDPOINT}${destination}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body)
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e));
        return res.json();
      })
      .then(() => this.sendGetRequest())
      .catch(
        error => this.setState({ error })
      );
  }

  componentDidMount() {
    this.sendGetRequest();
  }

  // grabs notes and folders from server, then update state
  sendGetRequest() {
    Promise.all([
      fetch(`${config.API_ENDPOINT}notes/`, {
        headers:
        {
          'Authorization': `Bearer ${config.API_KEY}`,
          'content-type': 'application/json',
        },

      }),
      fetch(`${config.API_ENDPOINT}folders/`, {
        headers:
        {
          'Authorization': `Bearer ${config.API_KEY}`,
          'content-type': 'application/json',
        },
      })
    ])
      // checks to make sure there are no errors in ajax responses
      .then(([notesRes, foldersRes]) => {
        if (!notesRes.ok)
          return notesRes.json().then(e => Promise.reject(e));
        if (!foldersRes.ok)
          return foldersRes.json().then(e => Promise.reject(e));

        // returns the notes and folders as json objects in an array
        return Promise.all([notesRes.json(), foldersRes.json()]);
      })
      // sets state for both notes and folders
      .then(([notes, folders]) => {
        this.setState({ notes, folders });
      })
      // error catch all
      .catch(error => {
        console.error({ error });
      });
  }

  render() {
    const value = {
      folders: this.state.folders,
      notes: this.state.notes,
      deleteNote: this.handleDeleteNote,
      post: this.handlePostRequest
    };
    return (
      <NotefulContext.Provider value={value} >
        <div className='App'>
          <header>
            <Link to='/'>Noteful</Link>
          </header>
          <div className="flex-container">
            <NotefulError>
              <section className="column sidebar">
                <Route
                  exact
                  path="/"
                  component={FolderList} />
                <Route
                  path="/folder/:folderId"
                  component={FolderList} />
                <Route
                  path="/note/:noteId"
                  component={FullNoteSide} />
              </section>
            </NotefulError>
            <NotefulError>
              <main className="column">
                <Route exact
                  path="/"
                  component={NoteList} />
                <Route
                  path="/folder/:folderId"
                  component={NoteList} />
                <Route
                  path="/note/:noteId"
                  component={FullNoteMain} />
              </main>
            </NotefulError>
          </div>
        </div>
      </NotefulContext.Provider>
    );
  }
}

export default App;
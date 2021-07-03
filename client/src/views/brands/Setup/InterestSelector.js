import React from 'react'
import request from '../../../helpers/request'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import { TagCloud } from 'react-tagcloud'
import { Button } from 'reactstrap'

export default function InterestSelector ({ defaultValues=[], showHeader=true, onChange }) {
  const [interests, setInterests] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const updateDefaultValues = ()=>{
    return defaultValues.reduce((acc, value) => {
      acc[value] = value
      return acc
    }, {})
  }

  const [selectedInterests, setSelectedInterests] = React.useState(updateDefaultValues())

  React.useEffect(() => {
    loadInterests()
  }, [])


  function loadInterests () {
    setLoading(true)
    return request
      .get('/interests')
      .then(response => setInterests(response.data))
      .finally(() => {
        setLoading(false)
      })
  }

  const selectOrDeSelectTag = tag => {
    const isExistingTag = selectedInterests[tag.id]
    if (isExistingTag) {
      delete selectedInterests[tag.id]
    } else {
      selectedInterests[tag.id] = tag.id
    }
    setSelectedInterests(Object.assign({}, selectedInterests))
    onChange && onChange(Object.values(selectedInterests))
  }

  const customRenderer = (tag, size) => {
    return (
      <div
        key={tag.id}
        style={{
          margin: '3px',
          padding: '3px',
          display: 'inline-block'
        }}
      >
        <Button
          onClick={() => selectOrDeSelectTag(tag)}
          type='button'
          color={selectedInterests[tag.id] ? 'primary' : 'light'}
        >
          {tag.name}
        </Button>
      </div>
    )
  }

  if (loading) return <Spinner />
  return (
    <div>
      {showHeader && <h3>Select your interests</h3>}
      <TagCloud
        tags={interests}
        minSize={1}
        maxSize={5}
        renderer={customRenderer}
      />
    </div>
  )
}

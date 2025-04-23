import React from 'react'
import WelcomeContainer from './_components/WelcomeContainer'
import CreateOptions from './_components/CreateOptions'
import LatestInterviesList from './_components/LatestInterviesList'

const Page = () => {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <WelcomeContainer />

        <CreateOptions />

        <LatestInterviesList />
      </div>
    </div>
  )
}

export default Page
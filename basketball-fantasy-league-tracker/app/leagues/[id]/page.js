import {prisma} from "@/lib/prisma"

export default async function newLeaguePage({params}) {

    //id is gotten from the name of my dynamic route folder
    const leagueIdentification =  params.id


    //stores the league id into the id field
    const league = await prisma.league.findUnique({
      where: {
        id: leagueIdentification
      },

      //we ensure that we get access to the fields
      include: {
        creator: true,

        //nested user model since we need access to the user name. LeagueMember only gives us the user id
        leagueMember: {
          include: {
            user: true
          }
        },
        team: true,
        
      }
    })


    //if league doesn't exist show the print statement
    if (!league) {
      return <p>League not found</p>
    }
  return (
    <div>
        <p>League Name: {league.name}</p>
        <p>Number of members: {league.leagueMember.length}</p>
        <p>Creator: {league.creator.name}</p>
        
        {/*Iterates through each league member and shows their name */}
        {league.leagueMember.map((member) =>(
          <div key={member.id}>
              <li>{member.user.name}</li>
          </div>
        ))}
        
    </div>
  )
}

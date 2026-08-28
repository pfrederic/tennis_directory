Feature: Player search
  As a directory user
  I want to search and view players
  So that I know the ranking and details of each one

  Background:
    Given the following countries exist:
      | code |
      | FRA  |
    And the following players exist:
      | firstname | lastname | shortname | sex | birthday   | weight | height | points |
      | Novak     | Djokovic | N.DJO     | M   | 1987-05-22 |  80000 |    188 |   2542 |
      | Rafael    | Nadal    | R.NAD     | M   | 1986-06-03 |  85000 |    185 |   1982 |
      | Stan      | Wawrinka | S.WAW     | M   | 1985-03-28 |  81000 |    183 |   1784 |

  Scenario: Search for players sorted by descending points by default
    When I search for players
    Then the response has status 200
    And the ranking contains the following players in this order:
      | N.DJO |
      | R.NAD |
      | S.WAW |

  Scenario: Search for players sorted by ascending points
    When I search for players sorted by points in ascending order
    Then the response has status 200
    And the ranking contains the following players in this order:
      | S.WAW |
      | R.NAD |
      | N.DJO |

  Scenario: Paginated search for players
    When I search for players on page 1 with a page size of 2
    Then the response has status 200
    And the response contains 2 player(s)
    And the next page is available

  Scenario: Viewing an existing player by id
    When I view the profile of player "R.NAD"
    Then the response has status 200
    And the displayed profile is that of player "R.NAD"

  Scenario: Viewing a non-existent player
    When I view the profile of the player with id 999999
    Then the response has status 404

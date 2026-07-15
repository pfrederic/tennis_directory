Feature: Player creation
  As a ranking administrator
  I want to be able to create a player
  So that they appear in the player directory

  Background:
    Given the following countries exist:
      | code |
      | FRA  |

  Scenario: Successful player creation
    When I create a player with the following information:
      | firstname | lastname | shortname | sex | birthday   | weight | height | points | country |
      | Rafael    | Nadal    | R.NAD     | M   | 1986-06-03 | 85000  | 185    | 1982   | FRA     |
    Then the response has status 200
    And the player "R.NAD" now exists in the directory

  Scenario: Creation of several distinct players
    When I create a player with the following information:
      | firstname | lastname | shortname | sex | birthday   | weight | height | points | country |
      | Rafael    | Nadal    | R.NAD     | M   | 1986-06-03 | 85000  | 185    | 1982   | FRA     |
    And I create a player with the following information:
      | firstname | lastname | shortname | sex | birthday   | weight | height | points | country |
      | Stan      | Wawrinka | S.WAW     | M   | 1985-03-28 | 81000  | 183    | 1784   | FRA     |
    Then the response has status 200
    And the player "R.NAD" now exists in the directory
    And the player "S.WAW" now exists in the directory

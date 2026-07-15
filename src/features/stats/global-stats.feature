Feature: Global statistics
  As a directory user
  I want to view aggregate statistics about all players
  So that I can understand the overall population and the competitive landscape

  Scenario: Average BMI and height median across all players
    Given the following countries exist:
      | code |
      | FRA  |
    And the following players exist:
      | firstname | lastname | shortname | sex | birthday   | weight | height | points |
      | Alice     | Martin   | A.MAR     | F   | 1990-01-01 | 80000  | 200    | 1000   |
      | Bob       | Durand   | B.DUR     | M   | 1990-01-01 | 72000  | 160    | 1000   |
    When I view the global statistics
    Then the response has status 200
    And the average BMI is 24.0625
    And the height median is 180

  Scenario: Country with the best win ratio
    Given the following countries exist:
      | code |
      | FRA  |
      | ESP  |
    And the following players exist:
      | firstname | lastname | shortname | sex | birthday   | weight | height | points | country |
      | Fabien    | Petit    | F.PET     | M   | 1990-01-01 | 80000  | 185    | 1000   | FRA     |
      | Eva       | Lopez    | E.LOP     | F   | 1990-01-01 | 65000  | 170    | 1000   | ESP     |
    And the following match history is recorded for player "F.PET":
      | result | date       |
      | win    | 2026-07-01 |
      | loss   | 2026-06-24 |
    And the following match history is recorded for player "E.LOP":
      | result | date       |
      | win    | 2026-07-01 |
      | win    | 2026-06-24 |
    When I view the global statistics
    Then the response has status 200
    And the country with the best win ratio is "ESP" with a win ratio of 1

  Scenario: No statistics available when there is no data
    When I view the global statistics
    Then the response has status 200
    And the average BMI is 0
    And the height median is 0
    And there is no country with a best win ratio

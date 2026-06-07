# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\production\duplicateSlots.spec.js >> [SINY Dermatology — Cosmetic] No duplicate slots on production
- Location: tests\e2e\production\duplicateSlots.spec.js:102:5

# Error details

```
Test timeout of 600000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - img "logo" [ref=e9]
        - generic:
          - generic:
            - heading [level=6]
    - generic [ref=e13]:
      - generic [ref=e15]:
        - button "1" [ref=e17] [cursor=pointer]:
          - paragraph [ref=e18]: "1"
        - paragraph [ref=e21]: Location
      - generic [ref=e25]:
        - button "2" [ref=e27] [cursor=pointer]:
          - paragraph [ref=e28]: "2"
        - paragraph [ref=e31]: Intake Questions
      - generic [ref=e35]:
        - button "3" [ref=e37] [cursor=pointer]:
          - paragraph [ref=e38]: "3"
        - paragraph [ref=e41]: Choose Date & Time
      - generic [ref=e45]:
        - button "4" [ref=e47] [cursor=pointer]:
          - paragraph [ref=e48]: "4"
        - paragraph [ref=e51]: Add Info
  - generic [ref=e54]:
    - generic [ref=e57]:
      - paragraph [ref=e59]: Basic Search
      - separator [ref=e60]
      - generic [ref=e63]:
        - generic [ref=e64]: Location
        - generic [ref=e65]:
          - combobox "Location" [active] [ref=e66]: SINY Dermatology West Village
          - button "Open" [ref=e68] [cursor=pointer]:
            - img [ref=e69]
          - group:
            - generic: Location
      - separator [ref=e71]
      - generic [ref=e74]:
        - generic [ref=e75]: Service Type
        - generic [ref=e76]:
          - combobox "Service Type" [ref=e77]: Botox Treatment
          - button "Open" [ref=e79] [cursor=pointer]:
            - img [ref=e80]
          - group:
            - generic: Service Type
      - separator [ref=e82]
      - separator [ref=e83]
      - generic [ref=e84]:
        - paragraph [ref=e85]: Provider Gender
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88] [cursor=pointer]:
              - checkbox [checked] [ref=e89]
              - img [ref=e90]
            - paragraph [ref=e92]: Male
          - generic [ref=e93]:
            - generic [ref=e94] [cursor=pointer]:
              - checkbox [checked] [ref=e95]
              - img [ref=e96]
            - paragraph [ref=e98]: Female
    - generic [ref=e99]:
      - heading "Ronald Brancaccio Ronald Brancaccio Mon Jun 22 10:40 AM Mon Jun 22 10:50 AM Mon Jun 22 11:30 AM Show More" [level=3] [ref=e101]:
        - button "Ronald Brancaccio Ronald Brancaccio Mon Jun 22 10:40 AM Mon Jun 22 10:50 AM Mon Jun 22 11:30 AM Show More" [ref=e102]:
          - generic [ref=e105]:
            - img "Ronald Brancaccio" [ref=e107]
            - generic [ref=e108]:
              - paragraph [ref=e110]: Ronald Brancaccio
              - generic [ref=e111]:
                - button "Mon Jun 22 10:40 AM" [ref=e112] [cursor=pointer]:
                  - paragraph [ref=e113]: Mon Jun 22
                  - paragraph [ref=e114]: 10:40 AM
                - button "Mon Jun 22 10:50 AM" [ref=e115] [cursor=pointer]:
                  - paragraph [ref=e116]: Mon Jun 22
                  - paragraph [ref=e117]: 10:50 AM
                - button "Mon Jun 22 11:30 AM" [ref=e118] [cursor=pointer]:
                  - paragraph [ref=e119]: Mon Jun 22
                  - paragraph [ref=e120]: 11:30 AM
              - paragraph [ref=e121] [cursor=pointer]: Show More
      - heading "Jessica Dowling Jessica Dowling Tue Jun 9 8:00 AM Tue Jun 9 10:10 AM Tue Jun 9 3:10 PM Show More" [level=3] [ref=e123]:
        - button "Jessica Dowling Jessica Dowling Tue Jun 9 8:00 AM Tue Jun 9 10:10 AM Tue Jun 9 3:10 PM Show More" [ref=e124]:
          - generic [ref=e127]:
            - img "Jessica Dowling" [ref=e129]
            - generic [ref=e130]:
              - paragraph [ref=e132]: Jessica Dowling
              - generic [ref=e133]:
                - button "Tue Jun 9 8:00 AM" [ref=e134] [cursor=pointer]:
                  - paragraph [ref=e135]: Tue Jun 9
                  - paragraph [ref=e136]: 8:00 AM
                - button "Tue Jun 9 10:10 AM" [ref=e137] [cursor=pointer]:
                  - paragraph [ref=e138]: Tue Jun 9
                  - paragraph [ref=e139]: 10:10 AM
                - button "Tue Jun 9 3:10 PM" [ref=e140] [cursor=pointer]:
                  - paragraph [ref=e141]: Tue Jun 9
                  - paragraph [ref=e142]: 3:10 PM
              - paragraph [ref=e143] [cursor=pointer]: Show More
      - separator [ref=e144]
```
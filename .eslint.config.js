import globals from 'globals';

export default [
    {
    "rules": {
        "indent": [
            2,
            4
        ],
        "quotes": [
            2,
            "single"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ],
        "no-console": [
            1
        ]
    },
    languageOptions: {
        sourceType: "module",
        globals: {
          ...globals.node,
          ...globals.browser
        }
    }
}   
]
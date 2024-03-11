<template lang='pug'>
q-card.fit
  template(v-for='account in accounts')
    q-card-section.q-py-sm
      q-item(
        clickable
        v-ripple
        :active='account.selected'
        @click='selectAccount(account)'
      )
        q-item-section.flex.items-center(:style='{flexFlow: "row"}')
          q-img(:src="'https://mineskin.eu/avatar/' + account?.username + '/100.png'" width="50px")
          q-item-label.q-ml-md(v-text='account.username')
          q-space
          //- q-btn(href="https://www.minecraft.net/fr-fr/msaprofile" target="_blank" icon="mdi-account-circle" flat dense)
          q-btn.text-red(icon="mdi-delete" flat dense @click='deleteAccount(account)')

  //- q-card-section.q-py-sm
    q-item(
      clickable
      v-ripple
      @click='addAccount'
    )
      q-item-section.flex.items-center(:style='{flexFlow: "row"}')
        q-icon(name='mdi-plus')
        q-item-label.q-ml-md Ajouter un compte
</template>

<script lang="ts">
export default defineNuxtComponent({
  data: () => ({
    accounts: [],
  }),
  async setup() {
    const currentAccount = await window.electron.currentAccount()
    return {
      currentAccount,
    }
  },
  methods: {
    async getAccounts() {
      return (await window.electron.getAccounts()).map((account: any) => {
        return {
          ...account,
          selected: account.username === this.currentAccount,
        }
      })
    },
    deleteAccount(account: any) {
      window.electron.deleteAccount(account.username)
      this.accounts = this.accounts.filter((a: any) => a.username !== account.username)
    },
  },
  async created() {
    this.accounts = await this.getAccounts()
  }
})
</script>

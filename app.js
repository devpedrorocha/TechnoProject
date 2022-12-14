const vm = new Vue({
    el: "#app",
    data: {
        produtos: [],
        teste: 'teste',
        produto: false,
        carrinho: [],
        carrinhoAtivo: false,
        mensagemAlerta: "Item adicionado",
        alertaAtivo: false,

    },
    filters: {
        numeroPreco(valor) {
            return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }
    },
    computed: {
        carrinhoTotal() {
            let total = 0;
            if (this.carrinho.length) {
                this.carrinho.forEach(item => {
                    total += item.preco;
                })
            }
            return total;
        }
    },
    methods: {
        async fetchProdutos() {
            let data = await fetch("./api/produtos.json");
            data = await data.json();
            this.produtos = data;
        },
        async fetchProduto(id) {
            let data = await fetch(`./api/produtos/${id}/dados.json`);
            data = await data.json();
            this.produto = data;
        },
        abrirModal(id) {
            this.fetchProduto(id)
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        },
        fecharModal({ target, currentTarget }) {
            if (target === currentTarget) this.produto = false;
        },
        clickForaCarrinho({ target, currentTarget }) {
            if (target === currentTarget) this.carrinhoAtivo = false;
        },
        adicionarItem() {
            this.produto.estoque--;
            const { id, nome, preco } = this.produto;
            this.carrinho.push({ id, nome, preco });
            this.alerta(`${nome} foi adicionado ao carrinho`)
        },
        removerItem(index) {
            this.carrinho.splice(index, 1);
        },
        checarLocalStorage() {
            if (window.localStorage.carrinho) {
                this.carrinho = JSON.parse(window.localStorage.carrinho);
            }
        },
        compararEstoque() {
            const items = this.carrinho.filter(({ id }) => id === this.produto.id)

            this.produto.estoque -= items.length;
        },
        alerta(mensagem) {
            this.mensagemAlerta = mensagem;
            this.alertaAtivo = true;
            setTimeout(() => {
                this.alertaAtivo = false
            }, 2000)
        },
        router() {
            const hash = document.location.hash;
            if (hash)
                this.fetchProduto(hash.replace("#", ""))
        }
    },
    watch: {
        produto() {
            document.title = this.produto.nome || "Techno";
            const hash = this.produto.id || "";
            history.pushState(null, null, `#${hash}`)
            if (this.produto) {
                this.compararEstoque()
            }

        },
        carrinho() {
            window.localStorage.carrinho = JSON.stringify(this.carrinho);
        }
    },
    created() {
        this.fetchProdutos();
        this.checarLocalStorage();
        this.router();
    }
})
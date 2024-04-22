const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PROJECT_NAME = "iGram";

module.exports = {
    entry: path.resolve(__dirname, "src"),

    output: {
        filename: `${PROJECT_NAME}.js`,
        path: path.resolve(path.join(__dirname, `../../builds/${PROJECT_NAME}`))
    },
    devServer: {
        static: path.resolve(__dirname, `./src`),
        port: 8080
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                use: [
                    { loader: "babel-loader" },
                    { loader: "ts-loader" }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "images"
                        }
                    }
                ]
            }]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            inject: "body"
            // scriptLoading: 'blocking'
        })
    ]
};
